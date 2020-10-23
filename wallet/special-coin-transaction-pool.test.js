const SpecialCoinTransactionPool = require("./special-coin-transaction-pool");
const SpecialCoinTransaction = require("./special-coin-transaction");
const Wallet = require("./index");
const Blockchain = require("../blockchain");
const CoinGenerator = require("../coin_generator");

describe("Special Coin TransactionPool", () => {
  let tp, wallet, transaction, bc, coin, generator;

  beforeAll(async () => {
    tp = new SpecialCoinTransactionPool();
    wallet = new Wallet();
    await wallet.createWallet();
    bc = new Blockchain();
    await bc.addGenesisBlock();
    await bc.getChain();

    generator = new CoinGenerator(wallet, bc);
    coin = await generator.createAndDeployCoin(
      [wallet.publicKey],
      500,
      "default"
    );
    coin.amount = 30;
    await bc.getChain();
    transaction = wallet.createSpecialCoinTransaction(
      "r4nd-4dr335",
      coin,
      bc,
      tp
    );
  });

  it("adds transaction to the pool", () => {
    expect(tp.transactions.find((t) => t.id === transaction.id)).toEqual(
      transaction
    );
  });

  it("updates a transaction in the pool", () => {
    coin.amount = 40;
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.update(wallet, "foo-4ddr355", coin);
    tp.updateOrAddTransaction(newTransaction);

    expect(
      JSON.stringify(tp.transactions.find((t) => t.id === newTransaction.id))
    ).not.toEqual(oldTransaction);
  });

  it("clear transaction", () => {
    tp.clear();
    expect(tp.transactions).toEqual([]);
  });

  describe("mixing valid and corrupt transaction", () => {
    let validTransactions;

    beforeAll(async () => {
      tp.clear();
      validTransactions = [];
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        await wallet.createWallet();
        coin.amount = 30;
        transaction = wallet.createSpecialCoinTransaction(
          "r4nd-4dr355",
          coin,
          bc,
          tp
        );
        if (i % 2 == 0) {
          transaction.sInput.coin.amount = 99999;
          tp.transactions[i] = transaction;
        } else {
          validTransactions.push(transaction);
        }
      }
    });

    it("shows a difference between valid and corrupt transactions", () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(
        JSON.stringify(validTransactions)
      );
    });

    it("grabs valid transaction", () => {
      expect(JSON.stringify(tp.validTransactions("rsa"))).toEqual(
        JSON.stringify(validTransactions)
      );
    });
  });
});
