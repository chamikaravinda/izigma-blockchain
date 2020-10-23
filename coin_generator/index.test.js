const Generator = require("./index");
const Wallet = require("../wallet/index");
const Blockchain = require("../blockchain/index");

describe("Coin generator", () => {
  let generator, wallet, bc, coin;
  let recivers = ["ra4dm-452red", "rnd23m-4r2"];
  beforeAll(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    bc = new Blockchain();
    bc.addGenesisBlock();
    generator = new Generator(wallet, bc);
    coin = await generator.createAndDeployCoin(recivers, 1, "default");
    bc.getChain();
  });

  it("Check the coin name starts with given name", () => {
    expect(coin.coinId).toMatch(/(default#)/i);
  });

  it("Check the number of outputs ", () => {
    expect(bc.chain[bc.chain.length - 1].data[0].sOutputs.length).toEqual(
      recivers.length
    );
  });

  it("Check the input coin amout ", () => {
    expect(bc.chain[bc.chain.length - 1].data[0].sInput.coin.amount).toEqual(
      recivers.length * 1
    );
  });
});
