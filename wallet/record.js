const ChainUtil = require('../chain-util');
const { CONFIG_FILE } = require('../common-constant');
const { MINING_REWARD } = require(CONFIG_FILE);
const crypto = require("crypto")

class Record{
    constructor(){
        this.id =  ChainUtil.id();
        this.features=null;
        this.data = [];
    }

    static newRecord(creatorWallet,data){
        const record =  new this();
        record.data.push(...data);
        Record.signRecord(record,creatorWallet);
        return record;
    }

    static signRecord(record,creatorWallet){
        record.features={
            timestamp: Date.now(),
            createdBy: creatorWallet.publicKey,
            signature:creatorWallet.sign(ChainUtil.hash(record.data))
        }
    }

    static verifyRecord(record){
        return crypto.verify(
            "sha256",
            Buffer.from(ChainUtil.hash(record.data)),
            {
                key: record.features.createdBy,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                passphrase:'passphrase'
            },
            record.features.signature
        );
    }

}

module.exports = Record;