const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");
const Blockchain = require("../blockchain");

class Miner {
  constructor(transactioPool, recordPool, blockchain) {
    this.blockchain = blockchain;
    this.transactioPool = transactioPool;
    this.recordPool = recordPool;
    this.wallet = new Wallet();
  }

  mineTransactions() {
    this.wallet.createWallet();
    const validTransactions = this.transactioPool.validTransactions(
      this.wallet.algorithm
    );
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    const block = this.blockchain.addBlock(validTransactions);
    this.transactioPool.clear();
    return block;
  }

  mineRecord() {
    const validRecords = this.recordPool.validRecords(this.wallet.algorithm);
    const block = this.blockchain.addBlock(validRecords);
    this.recordPool.clear();
    return block;
  }
}

module.exports = Miner;
