const SHA256 = require("crypto-js/sha256");
const uuidV1 = require("uuid").v1;

class ChainUtil {
  static id() {
    return uuidV1();
  }

  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  static blockchainFile() {
    return "blockchain_data_" + Date.now().toString() + ".json";
  }
}

module.exports = ChainUtil;
