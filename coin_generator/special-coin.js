class SpecialCoin {
  constructor() {
    this.coinId = null;
    this.amount = 0;
  }

  toString() {
    return `Coin -
            CoinId: ${this.coinId}
            amount  : ${this.coinAmount}`;
  }
}

module.exports = SpecialCoin;
