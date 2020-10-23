const ChainUtil = require("../chain-util");
const { SECP256K1_ALGORITHM } = require("../common-constant");
const SpecialCoin = require("../coin_generator/special-coin");
const crypto = require("crypto");

class SpecialCoinTransaction {
  constructor() {
    this.id = ChainUtil.id();
    this.sInput = null;
    this.sOutputs = [];
  }

  // add the outputs to the transaction
  static transactionWithOutputs(senderWallet, outputs, coinId) {
    const transaction = new this();
    transaction.sOutputs.push(...outputs);
    SpecialCoinTransaction.signTransaction(transaction, senderWallet, coinId);
    return transaction;
  }

  // create a new transaction
  static newSpecialCoinTransaction(senderWallet, recipient, coin) {
    let senderWallteCoinBalanace;

    senderWallet.specialCoins.forEach((c) => {
      if (c.coinId === coin.coinId) {
        senderWallteCoinBalanace = c;
      }
    });

    if (!senderWallteCoinBalanace.amount) {
      console.log(`Coin balance is 0 of the coin type ${coin.coinId} ...`);
      return;
    }

    if (parseFloat(coin.amount) > parseFloat(senderWallteCoinBalanace.amount)) {
      console.log(
        `Amount: ${coin.amount} exceeds the current account balance...`
      );
      return;
    }

    let senderCoinAfterTransaction = new SpecialCoin();
    senderCoinAfterTransaction.coinId = coin.coinId;
    senderCoinAfterTransaction.amount =
      senderWallteCoinBalanace.amount - coin.amount;

    return SpecialCoinTransaction.transactionWithOutputs(
      senderWallet,
      [
        {
          coin: senderCoinAfterTransaction,
          address: senderWallet.publicKey,
        },
        { coin, address: recipient },
      ],
      coin.coinId
    );
  }

  // update a existing transaction
  update(senderWallet, recipient, coin) {
    const senderOutput = this.sOutputs.find(
      (output) => output.address === senderWallet.publicKey
    );

    if (parseFloat(coin.amount) > parseFloat(senderOutput.coin.amount)) {
      console.log(
        `Amount: ${coin.amount} exceeds balance...${senderOutput.coin.amount}`
      );
      return;
    }

    senderOutput.coin.amount = senderOutput.coin.amount - coin.amount;
    this.sOutputs.push({ coin, address: recipient });

    SpecialCoinTransaction.signTransaction(this, senderWallet, coin.coinId);

    return this;
  }

  // sing a transaction
  static signTransaction(transaction, senderWallet, coinId) {
    let sendersWalletSpecialCoin = "";
    senderWallet.specialCoins.forEach((c) => {
      if (JSON.stringify(coinId) == JSON.stringify(c.coinId)) {
        sendersWalletSpecialCoin = c;
      }
    });

    transaction.sInput = {
      timestamp: Date.now(),
      coin: sendersWalletSpecialCoin,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.sOutputs)),
    };
  }

  // verify a transaction
  static verifyTransaction(transaction, algorithm) {
    if (algorithm === SECP256K1_ALGORITHM) {
      let dataHash = ChainUtil.hash(transaction.sOutputs);
      let key = ec.keyFromPublic(transaction.sInput.address, "hex");
      return key.verify(dataHash, transaction.sInput.signature);
    } else {
      return crypto.verify(
        "sha256",
        Buffer.from(ChainUtil.hash(transaction.sOutputs)),
        {
          key: transaction.sInput.address,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          passphrase: "passphrase",
        },
        transaction.sInput.signature
      );
    }
  }
}

module.exports = SpecialCoinTransaction;
