const ChainUtil = require("../chain-util");
const SpecialCoin = require("./special-coin");
const SpecialCoinTransaction = require("../wallet/special-coin-transaction");

class CoinGenerator {
  constructor(wallet, blockchain) {
    this.creatorWallet = wallet;
    this.blockchain = blockchain;
  }
  // generate a coin
  createCoin(coinName) {
    let coin = new SpecialCoin();
    coin.coinId = coinName + "#" + ChainUtil.id();
    return coin;
  }

  // generate and send the coin to the users
  async createAndDeployCoin(recivers, coinForEachReciver, coinName) {
    let coin = this.createCoin(coinName);
    coin.amount = coinForEachReciver;

    await this.creatorWallet.createWallet();

    let transaction = new SpecialCoinTransaction();
    transaction.sOutputs = [];

    recivers.forEach((reciver) => {
      let output = {
        coin: coin,
        address: reciver,
      };

      transaction.sOutputs.push(output);
    });

    let inputCoin = new SpecialCoin();
    inputCoin.coinId = coin.coinId;
    inputCoin.amount = coinForEachReciver * recivers.length;

    transaction.sInput = {
      timestamp: Date.now(),
      coin: inputCoin,
      address: this.creatorWallet.publicKey,
      signature: this.creatorWallet.sign(ChainUtil.hash(transaction.sOutputs)),
    };

    await this.blockchain.addBlock([transaction]);
    return coin;
  }
}

module.exports = CoinGenerator;
