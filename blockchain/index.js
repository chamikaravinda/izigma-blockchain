const Block = require('./block');
const FileWriter = require('./fileWriter');
const writer =  new FileWriter();

class Blockchain {
    
    constructor(){
        this.chain = [];
    }

    async isBlockchainExsist(){
        return await writer.isBlockchainFileExsist();
    }
    
    async addBlock(data){
        const currentChain = await writer.readFromFile();
        const block = Block.mineBlock(currentChain[currentChain.length-1],data);
        await writer.writeToFile(block);
        return block;
    }

    async getChain(){
        this.chain = await writer.readFromFile();
        return this.chain;
    }


    async addGenesisBlock(){ 
            const block = Block.genesis();
            await writer.writeGenesisBlock(block);
    }

    async isValidChain(chain){
        let currentChain = await this.getChain();
         
        if(JSON.stringify(chain[0]) !== JSON.stringify(currentChain[0])) return false;

        for(let i=1;i<chain.length;i++){
            const block = chain[i];
            const lastBlock = chain [i-1];

            if(block.lastHash !== lastBlock.hash ||
                block.hash !== Block.blockHash(block)){
                return false;
            }
        }

        return true;
    }

    async replaceChain(newChain){
        let currentChain = await this.getChain();
        
        if(newChain.length <= currentChain.length){
            console.log('Received chain is not longer than the current chain . ');
            return;
        }else if(!this.isValidChain(newChain)){
            console.log('The received chain is not valid . ');
            return;
        }

        console.log('Replacing blockchain with the new chain...');

        await writer.replaceChain(newChain);
    }
}

module.exports =  Blockchain;