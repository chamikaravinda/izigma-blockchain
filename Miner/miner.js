const Wallet = require('../wallet'); 
const Transaction = require('../wallet/transaction');

class Miner {
    constructor(blockchain,transactioPool,wallet){
      this.blockchain = blockchain,
      this.transactioPool = transactioPool;
      this.wallet = wallet;
    }

    mine(){
        const validTransactions = this.transactioPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction(this.wallet,Wallet.blockchainWallet()));
        const block =  this.blockchain.addBlock(validTransactions);
        this.transactioPool.clear();
        return block;
    }
}

module.exports = Miner;