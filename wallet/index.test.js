const Wallet = require('./index')

describe('Wallet', () =>{
    let wallet;

    beforeEach(async ()=>{
        wallet = new Wallet();
        await wallet.createWallet();
    });

    it('check the keypair and public key not null',async ()=>{
        expect(wallet.publicKey).not.toEqual(null);
    });
});

