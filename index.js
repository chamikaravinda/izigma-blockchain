const Blockchain = require("./blockchain");
const Wallet = require("./wallet");
const TransactionPool = require("./wallet/transaction-pool");
const Miner = require("./miner/miner");
const RecordPool = require("./wallet/record-pool");

class IzigmaBlockchain {
  constructor() {
    this.chain = new Blockchain();
    this.chain.addGenesisBlock();
    this.wallet = new Wallet();
    this.wallet.createWallet();
    this.transactionPool = new TransactionPool();
    this.recordPool = new RecordPool();
    this.miner = new Miner(this.transactionPool, this.recordPool, this.chain);
  }

  /* --------Blockchain functions ------------- */

  //check is the blockchain exist
  /* Check the blockchain exist for that blockchain object. Get the file name from the object property. */
  async isBlockchainExsist() {
    return await this.chain.isBlockchainExsist();
  }

  //add a new block to the chain
  async addBlock(data) {
    return await this.chain.addBlock(data);
  }

  //geth the current blockchain
  async getChain() {
    return await this.chain.getChain();
  }

  //check the validity of the chain with compairing to a another chain.
  isValidChain(chain) {
    this.chain.isValidChain(chain);
  }

  //replace the current chain with a new chain
  replaceChain(newChain) {
    this.chain.replaceChain(newChain);
  }

  /* ------- Wallet functions --------- */

  //create a new wallet or get the current wallet data to the chain
  /* Don't pass the parameters unless you want to change the algorithm and keys. 
  Else the blockchain wallets works fine with RSA algorithm keys.A new wallet will be
  created if the parameters passed deleting the curent wallet */
  async createWallet(publicKey, privateKey, algorithm) {
    this.wallet.createWallet(publicKey, privateKey, algorithm);
  }

  //create a new transaction to the transaction pool
  async createTransaction(recipient, amount) {
    await this.chain.getChain();
    return this.wallet.createTransaction(
      recipient,
      amount,
      this.chain,
      this.transactionPool
    );
  }

  //create a new record to the record pool
  async createRecord(data) {
    return this.wallet.createRecord(data, this.recordPool);
  }

  //get the public key of this node
  getPublicKey() {
    this.wallet.createWallet();
    if (this.wallet.publicKey !== null) {
      return this.wallet.publicKey;
    } else {
      return JSON.stringify({
        message: "execute the createWallet method first...",
      });
    }
  }

  /* --------- Transaction Pool Functions ---------- */

  //get the current transaction pool
  getTransactionPool() {
    return this.transactionPool.transactions;
  }

  //clear the current transaction pool
  clearTransactionPool() {
    return this.transactionPool.clear();
  }

  /* --------- Record Pool Functions ---------- */

  //get the current record pool
  getRecordPool() {
    return this.recordPool.records;
  }

  //clear the current record pool
  clearRecordPool() {
    return this.recordPool.clear();
  }

  /* --------- Mine Functions ---------- */

  //mine the transaction
  async mineTransactions() {
    return this.miner.mineTransactions();
  }

  //mine the records
  async mineRecords() {
    return this.miner.mineRecord();
  }
}

module.exports = IzigmaBlockchain;
