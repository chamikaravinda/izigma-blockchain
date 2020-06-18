const Wallet = require('./index')

describe('Wallet', () =>{
    let wallet;

    beforeEach(async ()=>{
        wallet = new Wallet();
        await wallet.createWallet();
    });

    it('check the keypair and public key not null',async ()=>{
        console.log(wallet.toString());
        expect(wallet.keyPair).not.toEqual(null);
    });
});

