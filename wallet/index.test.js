const Wallet = require("./index");
const TransactionPool = require("./transaction-pool");
const Blockchain = require("../blockchain");
const CoinGenerator = require("../coin_generator/index");
const SpecialCoinTransactionPool = require("./special-coin-transaction-pool");
const {
  CONFIG_FILE,
  SECP256K1_ALGORITHM,
  RSA_ALGORITHM,
} = require("../common-constant");
const { INITIAL_BALANCE } = require(CONFIG_FILE);
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const FileWriter = require("./fileWriter");
const writer = new FileWriter();

describe("Wallet", () => {
  let wallet, tp, bc, generator, coin, stp;

  beforeAll(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    tp = new TransactionPool();
    stp = new SpecialCoinTransactionPool();
    bc = new Blockchain();
    await bc.addGenesisBlock();
    generator = new CoinGenerator(wallet, bc);
    coin = await generator.createAndDeployCoin(
      [wallet.publicKey],
      500,
      "default"
    );
    await bc.getChain();
  });

  it("check the public key not null", async () => {
    expect(wallet.publicKey).not.toEqual(null);
  });

  it("check the private key not null", async () => {
    expect(wallet.privateKey).not.toEqual(null);
  });

  describe("creating a transaction", () => {
    let transaction, sendAmount, recipient;

    beforeAll(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr355";
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe("and doing the same transaction", () => {
      beforeAll(() => {
        wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        expect(
          transaction.outputs.find(
            (output) => output.address === wallet.publicKey
          ).amount
        ).toEqual(wallet.balance - sendAmount * 2);
      });

      it("clones the  `sendAmount` output for the recipient", () => {
        expect(
          transaction.outputs
            .filter((output) => output.address === recipient)
            .map((output) => output.amount)
        ).toEqual([sendAmount, sendAmount]);
      });
    });
  });

  describe("creating a special coin transaction", () => {
    let sTransaction, sendCoin, recipient;

    beforeAll(() => {
      sendCoin = coin;
      sendCoin.amount = 50;
      recipient = "r4nd0m-4ddr355";
      sTransaction = wallet.createSpecialCoinTransaction(
        recipient,
        sendCoin,
        bc,
        stp
      );
    });

    describe("and doing the same transaction", () => {
      beforeAll(() => {
        wallet.createSpecialCoinTransaction(recipient, sendCoin, bc, stp);
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        expect(
          sTransaction.sOutputs.find(
            (output) => output.address === wallet.publicKey
          ).coin.amount
        ).toEqual(500 - sendCoin.amount * 2);
      });

      it("clones the  `sendAmount` output for the recipient", () => {
        expect(
          sTransaction.sOutputs
            .filter((output) => output.address === recipient)
            .map((output) => output.coin.amount)
        ).toEqual([sendCoin.amount, sendCoin.amount]);
      });
    });
  });

  describe("calculating a balance", () => {
    let addBalance, repeatAdd, senderWallet;

    beforeAll(async () => {
      tp.clear();
      await bc.getChain();
      senderWallet = new Wallet();
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

      senderWallet.publicKey = publicKey;
      senderWallet.privateKey = privateKey;
      senderWallet.algorithm = RSA_ALGORITHM;
      addBalance = 100;
      repeatAdd = 3;
      await bc.getChain();
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }
      await bc.addBlock(tp.transactions);
      await bc.getChain();
      tp.clear();
    });

    it("calculate the balance for blockchain transaction matching the recipient", () => {
      expect(wallet.calculateBalance(bc)).toEqual(
        parseFloat(INITIAL_BALANCE) + parseFloat(addBalance * repeatAdd)
      );
    });

    it("calculate the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(
        parseFloat(INITIAL_BALANCE) - parseFloat(addBalance * repeatAdd)
      );
    });

    describe("and the recipient conducts a transaction", () => {
      let subtractBalance, recipientBalance;

      beforeAll(async () => {
        tp.clear();
        subtractBalance = 60;
        await bc.getChain();
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey,
          subtractBalance,
          bc,
          tp
        );
        await bc.addBlock(tp.transactions);
        await bc.getChain();
        tp.clear();
      });

      describe("and the sender sends another transaction to the recipien", () => {
        beforeEach(async () => {
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          await bc.addBlock(tp.transactions);
          await bc.getChain();
        });

        it("calculate the recipient balanace only using transactions since its most recent one", () => {
          expect(wallet.calculateBalance(bc)).toEqual(
            recipientBalance - subtractBalance + addBalance
          );
        });
      });
    });
  });

  describe("calculating a special coin balance", () => {
    let addCoin, repeatAdd, senderWallet;

    beforeAll(async () => {
      stp.clear();
      senderWallet = new Wallet();
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

      senderWallet.publicKey = publicKey;
      senderWallet.privateKey = privateKey;
      senderWallet.algorithm = RSA_ALGORITHM;
      coin = await generator.createAndDeployCoin(
        [wallet.publicKey, senderWallet.publicKey],
        500,
        "default"
      );
      await bc.getChain();
      addCoin = coin;
      addCoin.amount = 100;
      repeatAdd = 3;
      await bc.getChain();
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createSpecialCoinTransaction(
          wallet.publicKey,
          addCoin,
          bc,
          stp
        );
      }
      await bc.addBlock(stp.transactions);
      await bc.getChain();
    });

    it("calculate the balance for blockchain transaction matching the recipient", async () => {
      await bc.getChain();
      expect(wallet.calculateSpecialCoinBalance(bc, coin)).toEqual(
        parseFloat(500) + parseFloat(addCoin.amount * repeatAdd)
      );
    });

    it("calculate the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateSpecialCoinBalance(bc, coin)).toEqual(
        parseFloat(500) - parseFloat(addCoin.amount * repeatAdd)
      );
    });

    describe("and the recipient conducts a transaction", () => {
      let subtractCoin, recipientBalance;

      beforeAll(async () => {
        stp.clear();
        await bc.getChain();
        subtractCoin = coin;
        subtractCoin.amount = 60;
        recipientBalance = wallet.calculateSpecialCoinBalance(bc, coin);
        wallet.createSpecialCoinTransaction(
          senderWallet.publicKey,
          subtractCoin,
          bc,
          stp
        );
        await bc.addBlock(stp.transactions);
        await bc.getChain();
        stp.clear();
      });

      describe("and the sender sends another transaction to the recipien", () => {
        beforeAll(async () => {
          stp.clear();
          senderWallet.createSpecialCoinTransaction(
            wallet.publicKey,
            addCoin,
            bc,
            stp
          );
          await bc.addBlock(stp.transactions);
          await bc.getChain();
        });

        it("calculate the recipient balanace only using transactions since its most recent one", () => {
          expect(wallet.calculateSpecialCoinBalance(bc, coin)).toEqual(
            recipientBalance - subtractCoin.amount + addCoin.amount
          );
        });
      });
    });
  });
});

//Wallet check with the custome Keys
describe("Wallet with Custome Keys", () => {
  let wallet2, tp2, bc2, generator2, coin2, stp2;
  let privateKey =
    "d898a0f5264c7470e95195a270c3bdd0ad67de815c5f509a0caca9bf36ed0916";
  let publicKey =
    "033af71cd3a5e392e2c28ba1cda32606584b19735056e54d03d2dd8bd210d99395";

  beforeAll(async () => {
    wallet2 = new Wallet();
    await wallet2.createWallet(publicKey, privateKey, SECP256K1_ALGORITHM);
    tp2 = new TransactionPool();
    stp2 = new SpecialCoinTransactionPool();
    bc2 = new Blockchain();
    await bc2.addGenesisBlock();
    await bc2.getChain();
    generator2 = new CoinGenerator(wallet2, bc2);
    coin2 = await generator2.createAndDeployCoin(
      [wallet2.publicKey],
      500,
      "default"
    );
    await bc2.getChain();
  });

  afterAll(async () => {
    let data = await writer.writeToWallet();
  });

  it("check the public key not null", async () => {
    expect(wallet2.publicKey).not.toEqual(null);
  });

  it("check the private key not null", async () => {
    expect(wallet2.privateKey).not.toEqual(null);
  });

  describe("creating a transaction", () => {
    let transaction, sendAmount, recipient;

    beforeAll(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr355";
      transaction = wallet2.createTransaction(recipient, sendAmount, bc2, tp2);
    });

    describe("and doing the same transaction", () => {
      beforeAll(() => {
        wallet2.createTransaction(recipient, sendAmount, bc2, tp2);
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        expect(
          transaction.outputs.find(
            (output) => output.address === wallet2.publicKey
          ).amount
        ).toEqual(wallet2.balance - sendAmount * 2);
      });

      it("clones the  `sendAmount` output for the recipient", () => {
        expect(
          transaction.outputs
            .filter((output) => output.address === recipient)
            .map((output) => output.amount)
        ).toEqual([sendAmount, sendAmount]);
      });
    });
  });

  describe("creating a special transaction", () => {
    let sTransaction, sendCoin, recipient;

    beforeAll(() => {
      sendCoin = coin2;
      sendCoin.amount = 50;
      recipient = "r4nd0m-4ddr355";
      sTransaction = wallet2.createSpecialCoinTransaction(
        recipient,
        sendCoin,
        bc2,
        stp2
      );
    });

    describe("and doing the same transaction", () => {
      beforeAll(() => {
        wallet2.createSpecialCoinTransaction(recipient, sendCoin, bc2, stp2);
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        expect(
          sTransaction.sOutputs.find(
            (output) => output.address === wallet2.publicKey
          ).coin.amount
        ).toEqual(500 - sendCoin.amount * 2);
      });

      it("clones the  `sendAmount` output for the recipient", () => {
        expect(
          sTransaction.sOutputs
            .filter((output) => output.address === recipient)
            .map((output) => output.coin.amount)
        ).toEqual([sendCoin.amount, sendCoin.amount]);
      });
    });
  });

  describe("calculating a balance", () => {
    let addBalance, repeatAdd, senderWallet;

    beforeAll(async () => {
      tp2.clear();
      senderWallet = new Wallet();
      let keyPair = ec.genKeyPair();

      senderWallet.publicKey = keyPair.getPublic("hex");
      senderWallet.privateKey = keyPair.getPrivate("hex");
      senderWallet.algorithm = SECP256K1_ALGORITHM;
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet2.publicKey, addBalance, bc2, tp2);
      }
      await bc2.addBlock(tp2.transactions);
      await bc2.getChain();
    });

    it("calculate the balance for blockchain transaction matching the recipient", () => {
      expect(wallet2.calculateBalance(bc2)).toEqual(
        parseFloat(INITIAL_BALANCE) + parseFloat(addBalance * repeatAdd)
      );
    });

    it("calculate the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateBalance(bc2)).toEqual(
        parseFloat(INITIAL_BALANCE) - parseFloat(addBalance * repeatAdd)
      );
    });

    describe("and the recipient conducts a transaction", () => {
      let subtractBalance, recipientBalance;

      beforeAll(async () => {
        tp2.clear();
        await bc2.getChain();
        subtractBalance = 60;
        recipientBalance = wallet2.calculateBalance(bc2);
        wallet2.createTransaction(
          senderWallet.publicKey,
          subtractBalance,
          bc2,
          tp2
        );
        await bc2.addBlock(tp2.transactions);
        await bc2.getChain();
        tp2.clear();
      });


      describe("and the sender sends another transaction to the recipien", () => {
        beforeAll(async () => {
          tp2.clear();
          senderWallet.createTransaction(
            wallet2.publicKey,
            addBalance,
            bc2,
            tp2
          );
          await bc2.addBlock(tp2.transactions);
          await bc2.getChain();
        });

        it("calculate the recipient balanace only using transactions since its most recent one", () => {
          expect(wallet2.calculateBalance(bc2)).toEqual(
            recipientBalance - subtractBalance + addBalance
          );
        });
      });
    });
  });

  describe("calculating a special coin balance", () => {
    let addCoin, repeatAdd, senderWallet;

    beforeAll(async () => {
      stp2.clear();
      senderWallet = new Wallet();
      let keyPair = ec.genKeyPair();

      senderWallet.publicKey = keyPair.getPublic("hex");
      senderWallet.privateKey = keyPair.getPrivate("hex");
      senderWallet.algorithm = SECP256K1_ALGORITHM;
      coin2 = await generator2.createAndDeployCoin(
        [wallet2.publicKey, senderWallet.publicKey],
        500,
        "default"
      );
      await bc2.getChain();
      addCoin = coin2;
      addCoin.amount = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createSpecialCoinTransaction(
          wallet2.publicKey,
          addCoin,
          bc2,
          stp2
        );
      }
      await bc2.addBlock(stp2.transactions);
      await bc2.getChain();
    });

    it("calculate the balance for blockchain transaction matching the recipient", () => {
      expect(wallet2.calculateSpecialCoinBalance(bc2, coin2)).toEqual(
        parseFloat(500) + parseFloat(addCoin.amount * repeatAdd)
      );
    });

    it("calculate the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateSpecialCoinBalance(bc2, coin2)).toEqual(
        parseFloat(500) - parseFloat(addCoin.amount * repeatAdd)
      );
    });

    describe("and the recipient conducts a transaction", () => {
      let subtractCoin, recipientBalance;

      beforeAll(async () => {
        stp2.clear();
        await bc2.getChain();
        subtractCoin = coin2;
        subtractCoin.amount = 60;
        recipientBalance = wallet2.calculateSpecialCoinBalance(bc2, coin2);
        wallet2.createSpecialCoinTransaction(
          senderWallet.publicKey,
          subtractCoin,
          bc2,
          stp2
        );
        await bc2.addBlock(stp2.transactions);
        await bc2.getChain();
        stp2.clear();
      });

      describe("and the sender sends another transaction to the recipien", () => {
        beforeAll(async () => {
          stp2.clear();
          senderWallet.createSpecialCoinTransaction(
            wallet2.publicKey,
            addCoin,
            bc2,
            stp2
          );
          await bc2.addBlock(stp2.transactions);
          await bc2.getChain();
        });

        it("calculate the recipient balanace only using transactions since its most recent one", () => {
          expect(wallet2.calculateSpecialCoinBalance(bc2, coin2)).toEqual(
            recipientBalance - subtractCoin.amount + addCoin.amount
          );
        });
      });
    });
  });
});
