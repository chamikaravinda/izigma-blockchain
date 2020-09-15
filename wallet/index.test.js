const Wallet = require("./index");
const TransactionPool = require("./transaction-pool");
const Blockchain = require("../blockchain");
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
  let wallet, tp, bc;

  beforeEach(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    tp = new TransactionPool();
    bc = new Blockchain();
    await bc.addGenesisBlock();
  });

  it("check the public key not null", async () => {
    expect(wallet.publicKey).not.toEqual(null);
  });

  it("check the private key not null", async () => {
    expect(wallet.privateKey).not.toEqual(null);
  });

  describe("creating a transaction", () => {
    let transaction, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr355";
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe("and doing the same transaction", () => {
      beforeEach(() => {
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

  describe("calculating a balance", () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(async () => {
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
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }
      await bc.addBlock(tp.transactions);
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

      beforeEach(async () => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey,
          subtractBalance,
          bc,
          tp
        );
        await bc.addBlock(tp.transactions);
      });

      describe("and the sender sends another transaction to the recipien", () => {
        beforeEach(async () => {
          tp.clear();
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          await bc.addBlock(tp.transactions);
        });

        it("calculate the recipient balanace only using transactions since its most recent one", () => {
          expect(wallet.calculateBalance(bc)).toEqual(
            recipientBalance - subtractBalance + addBalance
          );
        });
      });
    });
  });
});

//Wallet check with the custome Keys
describe("Wallet with Custome Keys", () => {
  let wallet, tp, bc;
  let privateKey =
    "d898a0f5264c7470e95195a270c3bdd0ad67de815c5f509a0caca9bf36ed0916";
  let publicKey =
    "033af71cd3a5e392e2c28ba1cda32606584b19735056e54d03d2dd8bd210d99395";
  beforeEach(async () => {
    wallet = new Wallet();
    await wallet.createWallet(publicKey, privateKey, SECP256K1_ALGORITHM);
    tp = new TransactionPool();
    bc = new Blockchain();
    await bc.addGenesisBlock();
    await bc.getChain();
  });

  afterAll(async () => {
    let data = await writer.writeToWallet();
    this.publicKey = data.publicKey;
    this.privateKey = data.privateKey;
    this.algorithm = data.algorithm;
  });

  it("check the public key not null", async () => {
    expect(wallet.publicKey).not.toEqual(null);
  });

  it("check the private key not null", async () => {
    expect(wallet.privateKey).not.toEqual(null);
  });

  describe("creating a transaction", () => {
    let transaction, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr355";
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe("and doing the same transaction", () => {
      beforeEach(() => {
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

  describe("calculating a balance", () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(async () => {
      senderWallet = new Wallet();
      let keyPair = ec.genKeyPair();

      senderWallet.publicKey = keyPair.getPublic("hex");
      senderWallet.privateKey = keyPair.getPrivate("hex");
      senderWallet.algorithm = SECP256K1_ALGORITHM;
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }
      await bc.addBlock(tp.transactions);
      await bc.getChain();
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

      beforeEach(async () => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey,
          subtractBalance,
          bc,
          tp
        );
        await bc.addBlock(tp.transactions);
        await bc.getChain();
      });

      describe("and the sender sends another transaction to the recipien", () => {
        beforeEach(async () => {
          tp.clear();
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
});
