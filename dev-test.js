const Wallet = require('./wallet');
const wallet =  new Wallet();
wallet.createWallet();
setTimeout(()=>{},3000);
while(wallet.publicKey !== null){
    console.log(wallet.toString());
}
