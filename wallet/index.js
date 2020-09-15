const FileWriter = require("./fileWriter");
const Transaction = require("./transaction");
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
  }

  toString() {
    return `Wallet -
        publicKey: ${this.publicKey}
        balance  : ${this.balance}`;
  }

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

  createRecord(data, recordPool) {
    if (!data) {
      console.log(`Recived data is empty`);
      return;
    }

    let record = Record.newRecord(this, data);
    recordPool.addRecord(record);

    return record;
  }

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
      const recentInputT = walletInputTs.reduce((prev, current) =>
        prev.input.timestamp > current.input.timestamp ? prev : current
      );

      balance = recentInputT.outputs.find(
        (output) =>
          JSON.stringify(output.address) === JSON.stringify(this.publicKey)
      ).amount;
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

  static blockchainWallet() {
    if (this.algorithm === SECP256K1_ALGORITHM) {
      const blockchainWallet = new this();
      let privateKey;
      do {
        privateKey = randomBytes(32);
      } while (!secp256k1.privateKeyVerify(privateKey));

      const publicKey = secp256k1.publicKeyCreate(privKey);

      blockchainWallet.publicKey = publicKey;
      blockchainWallet.privateKey = privateKey;
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
