const Wallet = require('../wallet'); 
const Transaction = require('../wallet/transaction');

class Miner {
    constructor(blockchain,transactioPool,recordPool,wallet){
      this.blockchain = blockchain,
      this.transactioPool = transactioPool;
      this.recordPool = recordPool;
      this.wallet = wallet;
    }

    mineTransactions(){
        const validTransactions = this.transactioPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction(this.wallet,Wallet.blockchainWallet()));
        const block =  this.blockchain.addBlock(validTransactions);
        this.transactioPool.clear();
        return block;
    }

    mineRecord(){
      const validRecords = this.recordPool.validRecords();
      const block =  this.blockchain.addBlock(validRecords);
      this.recordPool.clear();
      return block;
  }
  
}

module.exports = Miner;