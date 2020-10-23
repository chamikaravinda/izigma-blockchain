const fs = require("fs");
const { BLOCKCHAIN_FILE } = require("../common-constant");
const ChainUtil = require("../chain-util");

class BlockchainFileWriter {
  // create the blockchain file
  async writeGenesisBlock(block) {
    let chain = [];

    const data = {
      hash: block.hash,
      lastHash: block.lastHash,
      timestamp: block.timestamp,
      nonce: block.nonce,
      difficulty: block.difficulty,
      data: block.data,
    };

    chain.push(data);
    const fileName = ChainUtil.blockchainFile();
    await fs.writeFileSync(
      fileName,
      JSON.stringify(chain, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.log("Error in creating the genesis block...");
        } else {
          console.log("Genesis block added...");
        }
      }
    );
    return fileName;
  }

  // write a block to the chain
  async writeToFile(block, fileName) {
    const data = {
      hash: block.hash,
      lastHash: block.lastHash,
      timestamp: block.timestamp,
      nonce: block.nonce,
      difficulty: block.difficulty,
      data: block.data,
    };

    let chain = await fs.readFileSync(fileName, "utf8", function (err) {
      if (err) {
        if (err.code === "ENOENT") {
          console.log("Create the chain first...");
        } else {
          console.log("Error in writing the block to the chain...");
        }
        return;
      }
    });

    chain = JSON.parse(chain);
    chain.push(data);

    await fs.writeFileSync(
      fileName,
      JSON.stringify(chain, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.log("Error in writing the block to the chain...");
        } else {
          console.log("Block added...");
        }
      }
    );
    return chain;
  }

  // replace the current chain with a new chain
  async replaceChain(chain, fileName) {
    await fs.writeFileSync(
      fileName,
      JSON.stringify(chain, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.log("Error in replacing the chain...");
        } else {
          console.log("Blockchin replaced...");
        }
      }
    );
  }

  // read the blockchain
  async readFromFile(fileName) {
    let chain = await fs.readFileSync(fileName, "utf8", (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.log("Create the chain first...");
        } else {
          console.log("Error in writing the  block to the chain...");
        }
        return;
      }
    });
    chain = JSON.parse(chain);
    return chain;
  }

  // check the blockchain file exist
  async isBlockchainFileExsist(fileName) {
    try {
      let isExsiste = await fs.existsSync(fileName, (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      });
      return isExsiste;
    } catch (err) {
      console.log("Error in reading the blockchain file");
      return false;
    }
  }
}

module.exports = BlockchainFileWriter;
