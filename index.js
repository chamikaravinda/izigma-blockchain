const Blockchain  = require('./blockchain');
const Wallet = require('./wallet');
const TransactionPool  = require('./wallet/transaction-pool');
const Miner = require('./miner/miner');
const RecordPool = require('./wallet/record-pool');

class IzigmaBlockchain{

    constructor(){
          this.chain =  new Blockchain();
          this.wallet =  new Wallet();
          this.wallet.createWallet();
          this.transactionPool =  new  TransactionPool();
          this.recordPool = new RecordPool();
          this.miner= new Miner(this.chain,this.transactionPool,this.recordPool,this.wallet);
    }

    //Blockchain functions
    async isBlockchainExsist(){
        return await this.chain.isBlockchainExsist();
    }

    async addBlock(data){
        return await this.chain.addBlock(data);
    }

    async getChain(){
        return await this.chain.getChain();
    }

    async addGenesisBlock(){
        await this.chain.addGenesisBlock();
    }

    isValidChain(chain){
        this.chain.isValidChain(chain);
    }

    replaceChain(newChain){
        this.chain.replaceChain(newChain);
    }

    //Wallet functions
    async createWallet(){
        this.wallet.createWallet();
    }

    async createTransaction(recipient,amount){
        await this.chain.getChain();
        return this.wallet.createTransaction(recipient,amount,this.chain,this.transactionPool);
    }

    async createRecord(data){
        return this.wallet.createRecord(data,this.recordPool);
    }

    getPublicKey(){
        if(this.wallet.publicKey !== null){
            return this.wallet.publicKey;
        }else{
            return JSON.stringify({message:'Run the createWallet method first'});
        }
    }

    //Transaction Pool Functions
    getTransactionPool(){
        return this.transactionPool.transactions;
    }

    clearTransactionPool(){
        return this.transactionPool.clear();
    }

    //Transaction Pool Functions
    getRecordPool(){
        return this.recordPool.records;
    }

    clearTransactionPool(){
        return this.recordPool.clear();
    }
    
    
    //Mine function
    async mineTransactions(){
        return this.miner.mineTransactions();
    }

    async mineRecords(){
        return this.miner.mineRecord();
    }

}

module.exports = IzigmaBlockchain;