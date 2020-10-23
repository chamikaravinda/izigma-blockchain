const SpecialCoinTransaction = require("./special-coin-transaction");
const CoinGenerator = require("../coin_generator");
const Blockchain = require("../blockchain");
const Wallet = require("./index");
const { CONFIG_FILE } = require("../common-constant");
const { MINING_REWARD } = require(CONFIG_FILE);

describe("Special Coin Transaction", () => {
  let transaction, wallet, recipient, coin, bc, generator;

  beforeAll(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    bc = new Blockchain();
    await bc.addGenesisBlock();
    generator = new CoinGenerator(wallet, bc);
    coin = await generator.createAndDeployCoin(
      [wallet.publicKey],
      500,
      "default"
    );
    recipient = "r3c1p13nt";
    await bc.getChain();
    wallet.calculateSpecialCoinBalance(bc, coin);
    coin.amount = 50;
    transaction = SpecialCoinTransaction.newSpecialCoinTransaction(
      wallet,
      recipient,
      coin
    );
  });

  it("Outputs the `amount` subtracted from the wallet balance", () => {
    expect(
      transaction.sOutputs.find((output) => output.address === wallet.publicKey)
        .coin.amount
    ).toEqual(450);
  });

  it("Ouputs the `amount` added to the recipient", () => {
    expect(
      transaction.sOutputs.find((output) => output.address === recipient).coin
        .amount
    ).toEqual(coin.amount);
  });

  it("inputs the balance of the wallet", () => {
    let coinBalance = wallet.specialCoins.find((c) => c.coinId === coin.coinId);
    expect(transaction.sInput.coin.amount).toEqual(coinBalance.amount);
  });

  it("Validate a valid transaction", () => {
    expect(SpecialCoinTransaction.verifyTransaction(transaction)).toBe(true);
  });

  it("Invalid corrupt transaction", () => {
    transaction.sOutputs[0].amount = 50000;
    expect(SpecialCoinTransaction.verifyTransaction(transaction)).toBe(false);
  });

  describe("Transacting with an amount that exceeds the balance", () => {
    let transaction2;
    beforeAll(() => {
      coin.amount = 50000;
      transaction2 = SpecialCoinTransaction.newSpecialCoinTransaction(
        wallet,
        recipient,
        coin
      );
    });

    it("does not create the transaction", () => {
      expect(transaction2).toEqual(undefined);
    });
  });

  describe("and updating a transaction", () => {
    console.log(transaction);
    let nextCoin, nextRecipient;

    beforeAll(() => {
      nextCoin = coin;
      nextCoin.amount = 20;
      nextRecipient = "n3xt-4ddr355";
      transaction = transaction.update(wallet, nextRecipient, nextCoin);
    });

    it(`substracts the next amount from the senders's outputs`, () => {
      expect(
        transaction.sOutputs.find(
          (output) => output.address === wallet.publicKey
        ).coin.amount
      ).toEqual(430);
    });

    it("output an amount for the next recipient", () => {
      expect(
        transaction.sOutputs.find((output) => output.address === nextRecipient)
          .coin.amount
      ).toEqual(nextCoin.amount);
    });
  });
});
