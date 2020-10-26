const FileWriter = require("./fileWriter");
const Transaction = require("./transaction");
const SpecialCoinTransaction = require("./special-coin-transaction");
const SpecialCoin = require("../coin_generator/special-coin");
const Record = require("./record");
const crypto = require("crypto");
const {
  CONFIG_FILE,
  SECP256K1_ALGORITHM,
  RSA_ALGORITHM,
} = require("../common-constant");
const { INITIAL_BALANCE } = require(CONFIG_FILE);
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // 256-bit curve: `secp256k1`
const writer = new FileWriter();

class Wallet {
  constructor() {
    this.balance = parseFloat(INITIAL_BALANCE) || 0;
    this.publicKey = null;
    this.privateKey = null;
    this.algorithm = null;
    this.specialCoins = [];
  }

  toString() {
    return `Wallet -
        publicKey: ${this.publicKey}
        balance  : ${this.balance}`;
  }

  //create or read the wallet
  async createWallet(publicKey, privateKey, algorithm) {
    if (
      typeof publicKey !== "undefined" &&
      typeof privateKey !== "undefined" &&
      typeof algorithm !== "undefined"
    ) {
      let data = await writer.writeToWallet(publicKey, privateKey, algorithm);
      this.publicKey = data.publicKey;
      this.privateKey = data.privateKey;
      this.algorithm = data.algorithm;
    } else {
      let isWalletExist = await writer.isExsiste();
      if (!isWalletExist) {
        let data = await writer.writeToWallet();
        this.publicKey = data.publicKey;
        this.privateKey = data.privateKey;
        this.algorithm = data.algorithm;
      } else {
        let walletData = await writer.readFromWallet();
        this.publicKey = walletData.publicKey;
        this.privateKey = walletData.privateKey;
        this.algorithm = walletData.algorithm;
      }
    }
  }

  //sign any record or transaction using keys
  sign(data) {
    if (this.algorithm === SECP256K1_ALGORITHM) {
      let signature = ec.sign(data, this.privateKey, "hex", {
        canonical: true,
      });
      return signature;
    } else {
      const signature = crypto.sign("sha256", Buffer.from(data), {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        passphrase: "passphrase",
      });

      return signature;
    }
  }

  //create a regular transaction
  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(
        `Amount : ${amount} exceceds current balanace: ${this.balance}`
      );
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  //create a special coin transaction
  createSpecialCoinTransaction(
    recipient,
    coin,
    blockchain,
    specialCoinTransactionPool
  ) {
    const specialCoinBalance = this.calculateSpecialCoinBalance(
      blockchain,
      coin
    );
    if (parseFloat(coin.amount) > parseFloat(specialCoinBalance)) {
      console.log(
        `Amount : ${coin.amount} exceceds current balanace of ${coin.coinId} coins`
      );
      return;
    }

    let transaction = specialCoinTransactionPool.existingTransaction(
      this.publicKey
    );

    if (transaction) {
      transaction.update(this, recipient, coin);
    } else {
      transaction = SpecialCoinTransaction.newSpecialCoinTransaction(
        this,
        recipient,
        coin
      );
      specialCoinTransactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  //create a data record
  createRecord(data, recordPool) {
    if (!data) {
      console.log(`Recived data is empty`);
      return;
    }

    let record = Record.newRecord(this, data);
    recordPool.addRecord(record);

    return record;
  }

  //calculate the wallet balance of the regular coin
  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];

    blockchain.chain.forEach((block) => {
      if (Array.isArray(block.data)) {
        block.data.forEach((transaction) => {
          if (transaction.input) {
            transactions.push(transaction);
          }
        });
      }
    });

    const walletInputTs = transactions.filter(
      (transaction) =>
        JSON.stringify(transaction.input.address) ===
        JSON.stringify(this.publicKey)
    );

    let startTime = 0;

    if (walletInputTs.length > 0) {
      let recentInputT = walletInputTs[0];
      walletInputTs.forEach((transaction) => {
        if (transaction.input.timestamp > recentInputT.input.timestamp) {
          recentInputT = transaction;
        }
      });

      recentInputT.outputs.forEach((output) => {
        if (JSON.stringify(output.address) === JSON.stringify(this.publicKey)) {
          balance = output.amount;
        }
      });
      startTime = recentInputT.input.timestamp;
    }

    transactions.forEach((transaction) => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find((output) => {
          if (
            JSON.stringify(output.address) === JSON.stringify(this.publicKey)
          ) {
            balance += output.amount;
          }
        });
      }
    });

    return balance;
  }

  //calculate the wallet balance of the special coin
  calculateSpecialCoinBalance(blockchain, coin) {
    let balance = 0;
    let transactions = [];

    blockchain.chain.forEach((block) => {
      if (Array.isArray(block.data)) {
        block.data.forEach((transaction) => {
          if (transaction.sInput) {
            if (
              JSON.stringify(transaction.sInput.coin.coinId) ==
              JSON.stringify(coin.coinId)
            ) {
              transactions.push(transaction);
            }
          }
        });
      }
    });

    let walletInputTs = transactions.filter(
      (transaction) =>
        JSON.stringify(transaction.sInput.address) ===
        JSON.stringify(this.publicKey)
    );
    let startTime = 0;

    if (walletInputTs.length > 0) {
      let recentInputT = walletInputTs[0];

      walletInputTs.forEach((transaction) => {
        if (transaction.sInput.timestamp > recentInputT.sInput.timestamp) {
          recentInputT = transaction;
        }
      });

      recentInputT.sOutputs.forEach((output) => {
        if (JSON.stringify(output.address) === JSON.stringify(this.publicKey)) {
          balance = output.coin.amount;
        }
      });
      startTime = recentInputT.sInput.timestamp;
    }

    transactions.forEach((transaction) => {
      if (transaction.sInput.timestamp > startTime) {
        transaction.sOutputs.find((output) => {
          if (
            JSON.stringify(output.address) === JSON.stringify(this.publicKey)
          ) {
            balance += output.coin.amount;
          }
        });
      }
    });

    let isIncludeInBalance = false;
    this.specialCoins.forEach((c) => {
      if (c.coinId === coin.coinId) {
        c.amount = balance;
        isIncludeInBalance = true;
      }
    });

    if (!isIncludeInBalance) {
      let specialCoin = new SpecialCoin();
      specialCoin.coinId = coin.coinId;
      specialCoin.amount = balance;
      this.specialCoins.push(specialCoin);
    }
    return balance;
  }

  //create the blockchain wallet for the reward transactions
  static blockchainWallet() {
    if (this.algorithm === SECP256K1_ALGORITHM) {
      const blockchainWallet = new this();
      let key = ec.genKeyPair();

      blockchainWallet.publicKey = key.getPublic();
      blockchainWallet.privateKey = key.getPrivate();
      blockchainWallet.address = "blockchain-wallet";
      blockchainWallet.algorithm = SECP256K1_ALGORITHM;
      return blockchainWallet;
    } else {
      const blockchainWallet = new this();

      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,

        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },

        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase: "passphrase",
        },
      });

      blockchainWallet.publicKey = publicKey;
      blockchainWallet.privateKey = privateKey;
      blockchainWallet.address = "blockchain-wallet";
      blockchainWallet.algorithm = RSA_ALGORITHM;
      return blockchainWallet;
    }
  }
}

module.exports = Wallet;
