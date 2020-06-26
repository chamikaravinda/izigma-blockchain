const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction',() => {
    let transaction,wallet,recipient,amount;

    beforeEach(async()=>{
        wallet = new Wallet();
        await wallet.createWallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        transaction = Transaction.newTransaction(wallet,recipient,amount);
    });

    it('Outputs the `amount` subtracted from the wallet balance',()=>{
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount);
    });

    it('Ouputs the `amount` added to the recipient',()=>{
        expect(transaction.outputs.find(output => output.address === recipient).amount)
        .toEqual(amount);
    });

    describe('Transacting with an amount that exceeds the balance',()=>{
        beforeEach(()=>{
            amount =50000;
            transaction = Transaction.newTransaction(wallet,recipient,amount);
        });

        it('does not create the transaction',()=>{
            expect(transaction).toEqual(undefined);
        });
    });
});
