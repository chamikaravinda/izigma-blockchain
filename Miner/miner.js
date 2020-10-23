const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");
const SpecialCoinTransaction = require("../wallet/special-coin-transaction");
const Blockchain = require("../blockchain");

class Miner {
  constructor(
    transactioPool,
    specialCoinTransactionPool,
    recordPool,
    blockchain,
    wallet
  ) {
    this.blockchain = blockchain;
    this.transactioPool = transactioPool;
    this.specialCoinTransactionPool = specialCoinTransactionPool;
    this.recordPool = recordPool;
    this.wallet = wallet;
  }

  // mine transaction from transaction pool
  async mineTransactions() {
    await this.wallet.createWallet();
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

  // mine special coin transaction from transaction pool
  async mineSpecialCoinTransactions() {
    await this.wallet.createWallet();
    const validTransactions = this.specialCoinTransactionPool.validTransactions(
      this.wallet.algorithm
    );
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    const block = this.blockchain.addBlock(validTransactions);
    this.transactioPool.clear();
    return block;
  }

  // mine records from the record pool
  async mineRecord() {
    await this.wallet.createWallet();
    const validRecords = this.recordPool.validRecords(this.wallet.algorithm);
    const block = this.blockchain.addBlock(validRecords);
    this.recordPool.clear();
    return block;
  }
}

module.exports = Miner;
