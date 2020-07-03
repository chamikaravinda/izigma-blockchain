const ChainUtil = require('../chain-util');
const { CONFIG_FILE } = require('../common-constant');
const { MINING_REWARD } = require(CONFIG_FILE);
const crypto = require("crypto")

class Transaction {
    constructor(){
        this.id =  ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    static transactionWithOutputs(senderWallet,outputs){
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction,senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet,recipient,amount){
        if(amount>senderWallet.balance){
            console.log(`Amount: ${amount} exceeds the current account balance...`);
            return;
        }

        return Transaction.transactionWithOutputs(senderWallet,[
            { amount: senderWallet.balance - amount,address: senderWallet.publicKey},
            { amount, address : recipient}
        ]);   
    }

    static rewardTransaction(minerWallet,blockchainWallet){
        return Transaction.transactionWithOutputs(blockchainWallet,[{
            amount:MINING_REWARD,address:minerWallet.publicKey
        }]);
    }
    
    update(senderWallet,recipient,amount){
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if(amount>senderOutput.amount){
            console.log(`Amount: ${amount} exceeds balance...`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount,address:recipient});
        Transaction.signTransaction(this,senderWallet);

        return this;
    }
    

    static signTransaction(transaction,senderWallet){
        transaction.input={
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature:senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction){
        return crypto.verify(
            "sha256",
            Buffer.from(ChainUtil.hash(transaction.outputs)),
            {
                key: transaction.input.address,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                passphrase:'passphrase'
            },
            transaction.input.signature
        );
    }
}

module.exports = Transaction;