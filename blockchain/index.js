const Block = require("./block");
const FileWriter = require("./fileWriter");
const writer = new FileWriter();
const ChainUtil = require("../chain-util");
class Blockchain {
  constructor() {
    this.chain = [];
    this.fileName = "";
  }

  // Check the blockchain exist
  async isBlockchainExsist() {
    return await writer.isBlockchainFileExsist(this.fileName);
  }

  // add a block to the chain
  async addBlock(data) {
    const currentChain = await writer.readFromFile(this.fileName);
    const block = Block.mineBlock(currentChain[currentChain.length - 1], data);
    this.chain = await writer.writeToFile(block, this.fileName);
    return block;
  }

  // get the current blockchain
  async getChain() {
    this.chain = await writer.readFromFile(this.fileName);
    return this.chain;
  }

  // add a genesis block to the chain
  async addGenesisBlock() {
    const block = Block.genesis();
    this.fileName = await writer.writeGenesisBlock(block);
    this.chain = await this.getChain();
  }

  // check the blockchain is a valid chain
  async isValidChain(chain) {
    let currentChain = await this.getChain();

    if (JSON.stringify(chain[0]) !== JSON.stringify(currentChain[0]))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (
        block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)
      ) {
        return false;
      }
    }

    return true;
  }

  // replace the chain with a new incoming chain
  async replaceChain(newChain) {
    let currentChain = await this.getChain();

    // This is to replace initialy create chain with a downloaded chain
    if (currentChain.length === 1 && currentChain[0].lastHash === "0") {
      console.log(
        "Replacing blockchain only consist of genesis block with the recived chain..."
      );
      this.chain = newChain;
      await writer.replaceChain(newChain, this.fileName);
      return;
    }

    if (newChain.length <= currentChain.length) {
      console.log("Received chain is not longer than the current chain . ");
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log("The received chain is not valid . ");
      return;
    }

    console.log("Replacing blockchain with the new chain...");
    this.chain = newChain;
    await writer.replaceChain(newChain, this.fileName);
  }

  // calculate the blockchain hash
  async calculateBlockchainHash() {
    let currentChain = await this.getChain();
    return ChainUtil.hash(currentChain);
  }
}

module.exports = Blockchain;
