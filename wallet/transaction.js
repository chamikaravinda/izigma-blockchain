const ChainUtil = require('../chain-util');

class Transaction {
    constructor(){
        this.id =  ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    static newTransaction(senderWallet,recipient,amount){
        const transaction = new this(); 

        if(amount>senderWallet.balance){
            console.log(`Amount: ${amount} exceeds the current account balance...`);
            return;
        }

        transaction.outputs.push(...[
            { amount: senderWallet.balance -amount, address: senderWallet.publicKey },
            { amount, address: recipient}
        ]);
        
        Transaction.signTransaction(transaction,senderWallet);
        return transaction;
    }

    static signTransaction(transaction,senderWallet){
        transaction.input={
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature:senderWallet.sign(transaction.outputs)
        }
    }
}

module.exports = Transaction;