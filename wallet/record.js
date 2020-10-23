const ChainUtil = require("../chain-util");
const { SECP256K1_ALGORITHM } = require("../common-constant");
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // 256-bit curve: `secp256k1`
const cryptoJS = require("crypto-js");

class Record {
  constructor() {
    this.id = ChainUtil.id();
    this.features = null;
    this.data = [];
  }

  // create a new record
  static newRecord(creatorWallet, data) {
    const record = new this();
    record.data.push(data);
    Record.signRecord(record, creatorWallet);
    return record;
  }

  // sign the record
  static signRecord(record, creatorWallet) {
    record.features = {
      timestamp: Date.now(),
      createdBy: creatorWallet.publicKey,
      signature: creatorWallet.sign(ChainUtil.hash(record.data)),
    };
  }

  // verify the record
  static verifyRecord(record, algorithm) {
    if (algorithm === SECP256K1_ALGORITHM) {
      let key = ec.keyFromPublic(record.features.createdBy, "hex");
      return key.verify(ChainUtil.hash(record.data), record.features.signature);
    } else {
      return crypto.verify(
        "sha256",
        Buffer.from(ChainUtil.hash(record.data)),
        {
          key: record.features.createdBy,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          passphrase: "passphrase",
        },
        record.features.signature
      );
    }
  }
}

module.exports = Record;
