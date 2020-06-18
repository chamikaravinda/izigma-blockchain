const FileWriter = require('./fileWriter');
const { CONFIG_FILE } = require('../common-constant');
const { INITIIAL_BALANCE } =require(CONFIG_FILE);
const writer =  new FileWriter();

class Wallet {
    constructor(){
        this.balance = INITIIAL_BALANCE;
        this.keyPair = null;
        this.publicKey= null;
    }

    toString(){
        return `Wallet -
        publicKey: ${this.publicKey}
        balance  : ${this.balance}`
    }

    async createWallet(){
        await writer.writeToWallet();
        this.keyPair = await writer.getKeyPair();
        this.publicKey = await writer.getPublicKey();
    }
}

module.exports = Wallet;
