const Transaction = require("./transaction");
const Wallet = require("./index");
const { CONFIG_FILE } = require("../common-constant");
const { MINING_REWARD } = require(CONFIG_FILE);

describe("Transaction", () => {
  let transaction, wallet, recipient, amount;

  beforeEach(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    amount = 50;
    recipient = "r3c1p13nt";
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it("Outputs the `amount` subtracted from the wallet balance", () => {
    expect(
      transaction.outputs.find((output) => output.address === wallet.publicKey)
        .amount
    ).toEqual(wallet.balance - amount);
  });

  it("Ouputs the `amount` added to the recipient", () => {
    expect(
      transaction.outputs.find((output) => output.address === recipient).amount
    ).toEqual(amount);
  });

  it("inputs the balance of the wallet", () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it("Validate a valid transaction", () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it("Invalid corrupt transaction", () => {
    transaction.outputs[0].amount = 50000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe("Transacting with an amount that exceeds the balance", () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it("does not create the transaction", () => {
      expect(transaction).toEqual(undefined);
    });
  });

  describe("and updating a transaction", () => {
    let nextAmount, nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = "n3xt-4ddr355";
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it(`substracts the next amount from the senders's outputs`, () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });

    it("output an amount for the next recipient", () => {
      expect(
        transaction.outputs.find((output) => output.address === nextRecipient)
          .amount
      ).toEqual(nextAmount);
    });
  });

  describe("Create a reward transaction", () => {
    beforeEach(() => {
      transaction = Transaction.rewardTransaction(
        wallet,
        Wallet.blockchainWallet()
      );
    });

    it(`reward the miner's wallet`, () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(MINING_REWARD);
    });
  });
});
