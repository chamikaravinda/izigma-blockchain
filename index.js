const Blockchain = require("./blockchain");
const Wallet = require("./wallet");
const TransactionPool = require("./wallet/transaction-pool");
const SpecialCoinTransactionPool = require("./wallet/special-coin-transaction-pool");
const Miner = require("./miner/miner");
const RecordPool = require("./wallet/record-pool");
const CoinGenerator = require("./coin_generator/index");

class IzigmaBlockchain {
  /* Create the instances of the components */
  constructor() {
    this.chain = new Blockchain();
    this.chain.addGenesisBlock();
    this.wallet = new Wallet();
    this.transactionPool = new TransactionPool();
    this.specialCoinTransactionPool = new SpecialCoinTransactionPool();
    this.recordPool = new RecordPool();
    this.coinGenerator = new CoinGenerator(this.wallet, this.chain);
    //Miner
    this.miner = new Miner(
      this.transactionPool,
      this.specialCoinTransactionPool,
      this.recordPool,
      this.chain,
      this.wallet
    );
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

  //geth the blockchain file name
  async getChainFileName() {
    return await this.chain.fileName;
  }

  //geth the blockchain file hash
  async calculateBlockchainHash() {
    return await this.chain.calculateBlockchainHash();
  }
  /* ------- Wallet functions --------- */

  //create a new wallet or get the current wallet data to the chain
  /* Don't pass the parameters unless you want to change the algorithm and keys. 
  Else the blockchain wallets works fine with RSA algorithm keys.A new wallet will be
  created if the parameters passed deleting the curent wallet */
  async createWallet(publicKey, privateKey, algorithm) {
    await this.wallet.createWallet(publicKey, privateKey, algorithm);
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

  //create a new special coin transaction to the transaction pool
  async createSpecialCoinTransaction(recipient, coin) {
    await this.chain.getChain();
    return this.wallet.createSpecialCoinTransaction(
      recipient,
      coin,
      this.chain,
      this.specialCoinTransactioPool
    );
  }

  //create a new record to the record pool
  async createRecord(data) {
    return await this.wallet.createRecord(data, this.recordPool);
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

  //add Transaction or update a transaction in the pool
  //Can be used in syncing the transaction pool of the node with another node
  updateOrAddTransactionToTransactionPool(transaction) {
    return this.transactionPool.updateOrAddTransaction(transaction);
  }

  /* --------- Special Coin Transaction Pool Functions ---------- */

  //get the current transaction pool
  getSpecialCoinTransactionPool() {
    return this.specialCoinTransactionPool.transactions;
  }

  //clear the current transaction pool
  clearSpecialCoinTransactionPool() {
    return this.specialCoinTransactionPool.clear();
  }

  //add Transaction or update a transaction in the pool
  //Can be used in syncing the transaction pool of the node with another node
  updateOrAddTransactionToSpecialCoinTransactionPool(transaction) {
    return this.specialCoinTransactionPool.updateOrAddTransaction(transaction);
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
  //add record to the the record pool
  //Can be used in syncing the record pool of the node with another node
  addRecordToRecordPool() {
    return this.recordPool();
  }
  /* --------- Mine Functions ---------- */

  //mine the transaction
  async mineTransactions() {
    return await this.miner.mineTransactions();
  }

  //mine the transaction
  async mineSpecialCoinTransactions() {
    return await this.miner.mineSpecialCoinTransactions();
  }

  //mine the records
  async mineRecords() {
    return await this.miner.mineRecord();
  }

  /* --------- Coin generator Functions ---------- */
  // create and deploy a special coin
  async generateSpecailCoinandDeploy(recivers, coinsForEachReciver, coinName) {
    return await this.coinGenerator.createAndDeployCoin(
      recivers,
      coinsForEachReciver,
      coinName
    );
  }
}

module.exports = IzigmaBlockchain;
