const FileWriter = require('./fileWriter');
const crypto = require("crypto")
const { CONFIG_FILE } = require('../common-constant');
const { INITIIAL_BALANCE } =require(CONFIG_FILE);
const writer =  new FileWriter();

class Wallet {
    constructor(){
        this.balance = INITIIAL_BALANCE;
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

}

module.exports = Wallet;
