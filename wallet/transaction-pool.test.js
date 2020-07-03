const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain =  require('../blockchain');

describe('TransactionPool',()=>{
    let tp,wallet,transaction,bc;

    beforeEach(async ()=>{
        tp = new TransactionPool();
        wallet = new Wallet();
        await wallet.createWallet();
        bc = new Blockchain();
        await bc.addGenesisBlock();
        await bc.getChain();
        transaction = wallet.createTransaction('r4nd-4dr335',30,bc,tp);
    });

    it('adds transaction to the pool',() => {
        expect(tp.transactions.find(t => t.id ===transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool' , ()=>{
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet,'foo-4ddr355',40);
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t=>t.id ===newTransaction.id)))
        .not.toEqual(oldTransaction);

    });

    it('clear transaction',()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });
    
    describe('mixing valid and corrupt transaction',()=>{
        let validTransactions;

        beforeEach(async ()=>{
            tp.clear();
            validTransactions=[];
            for(let i=0;i<6;i++){
                wallet= new Wallet();
                await wallet.createWallet();
                transaction = wallet.createTransaction('r4nd-4dr355',30,bc,tp);
                if(i%2==0){
                    transaction.input.amount = 99999;
                    tp.transactions[i] = transaction;
                }else{
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid and corrupt transactions',()=>{
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transaction',()=>{
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });

});