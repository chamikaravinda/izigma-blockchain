const Blockchain  = require('./blockchain');

class IzigmaBlockchain{

    constructor(){
          this.chain =  new Blockchain();
    }

    //Blockchain functions
    async isBlockchainExsist(){
        return await this.chain.isBlockchainExsist();
    }

    async addBlock(data){
        return await this.chain.addBlock(data);
    }

    async getChain(){
        return await this.chain.getChain();
    }

    async addGenesisBlock(){
        await this.chain.addGenesisBlock();
    }

    isValidChain(chain){
        this.chain.isValidChain(chain);
    }

    replaceChain(newChain){
        this.chain.replaceChain(newChain);
    }

}

module.exports = IzigmaBlockchain;