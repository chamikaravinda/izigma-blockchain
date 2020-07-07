const FileWriter = require('./fileWriter');
const Transaction = require('./transaction');
const Record = require('./record');
const crypto = require("crypto");
const { CONFIG_FILE } = require('../common-constant');
const { INITIAL_BALANCE } =require(CONFIG_FILE);
const writer =  new FileWriter();

class Wallet {
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.publicKey = null;
        this.privateKey = null; 
    }

    toString(){
        return `Wallet -
        publicKey: ${this.publicKey}
        balance  : ${this.balance}`
    }

    async createWallet(){
        let isWalletExist = await writer.isExsiste();
        
        if(!isWalletExist){
            let data=await writer.writeToWallet();
            this.publicKey = data.publicKey;
            this.privateKey = data.privateKey; 
        }
        else{
            let walletData =  await writer.readFromWallet();
            this.publicKey = walletData.publicKey;
            this.privateKey = walletData.privateKey;
        }
    }

    sign(data){
        const signature = crypto.sign("sha256", Buffer.from(data), {
            key: this.privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            passphrase:'passphrase'
        });

        return signature;
    }

    createTransaction(recipient,amount,blockchain,transactionPool){

        this.balance = this.calculateBalance(blockchain);

        if(amount>this.balance){
            console.log(`Amount : ${amount} exceceds current balanace: ${this.balance}`)
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);
        
        if(transaction) {
            transaction.update(this,recipient,amount);
        }else{
            transaction = Transaction.newTransaction(this,recipient,amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    createRecord(data,recordPool){

        if(!data){
            console.log(`Recived data is empty`)
            return;
        }
        
        let record = Record.newRecord(this,data);
        recordPool.addRecord(record);

        return record;
    }


    calculateBalance(blockchain){ 

        let balance = this.balance;
        let transactions = [];

        blockchain.chain.forEach( block =>{
            if(Array.isArray(block.data)){
                block.data.forEach(transaction =>{
                        if(transaction.input){
                            transactions.push(transaction);  
                        }
                    }  
                )
            }
        });
        
        const walletInputTs=transactions
            .filter(transaction=>JSON.stringify(transaction.input.address)===JSON.stringify(this.publicKey));

        let startTime = 0;

        if(walletInputTs.length>0){
            const recentInputT=walletInputTs.reduce(
                (prev,current) => prev.input.timestamp>current.input.timestamp ? prev : current
            );

            balance = recentInputT.outputs.find(output=>JSON.stringify(output.address)=== JSON.stringify(this.publicKey)).amount;
            startTime =  recentInputT.input.timestamp;
        }

        transactions.forEach(transaction =>{
            if(transaction.input.timestamp > startTime){
                transaction.outputs.find(output =>{
                    if(JSON.stringify(output.address) === JSON.stringify(this.publicKey)){
                        balance +=output.amount;
                    }
                })
            }
        });

        return balance;
    }

    static blockchainWallet(){
        const blockchainWallet =  new this();
        
        const { publicKey, privateKey }  = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,

            publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
            },

            privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'passphrase'
            }
        });

        blockchainWallet.publicKey = publicKey;
        blockchainWallet.privateKey = privateKey;
        blockchainWallet.address ='blockchain-wallet';
        
        return blockchainWallet;
    }
}

module.exports = Wallet;
