const fs = require('fs');
const { BLOCKCHAIN_FILE } = require('../common-constant');



class BlockchainFileWriter{

    async writeGenesisBlock(block){

      let isExsiste = await this.isBlockchainFileExsist();

      if(!isExsiste){
        
        let chain=[];

        const data = {
            hash : block.hash,
            lastHash : block.lastHash,
            timestamp : block.timestamp,
            nonce : block.nonce,
            difficulty : block.difficulty,
            data: block.data
        }
  
        chain.push(data);
  
        await fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(chain,null,2), 'utf8',(err) => {
          if (err){
            console.log('Error in creating the genesis block...');
          }else{
            console.log("Genesis block added...");
          }
        });
      }
    }
 
    async writeToFile(block){
      await fs.readFile(BLOCKCHAIN_FILE, 'utf8', async function(err,data) {

        if(err){
            if (err.code === 'ENOENT') {
                console.log('Create the chain first...');
            }else{
                console.log('Error in writing the block to the chain...');
            }
            return;
        }

        let chain = JSON.parse(data);
        chain.push(block);

        await fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(chain,null,2), 'utf8',(err) => {
          if (err){
            console.log('Error in writing the block to the chain...');
          }else{
            console.log("Block added...");
          }
        });
      });    
    }


    async replaceChain(chain){
      await fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(chain,null,2), 'utf8',(err) => {
        if (err){
          console.log('Error in replacing the chain...');
        }else{
          console.log("Blockchin replaced...");
        }
      });    
    }

    async readFromFile(){
      let chain = await fs.readFileSync(BLOCKCHAIN_FILE, 'utf8', (err) => {
        if(err){
            if (err.code === 'ENOENT') {
                console.log('Create the chain first...');
            }else{
                console.log('Error in writing the  block to the chain...');
            }
            return;
        }
      });
      chain = JSON.parse(chain);
      return chain;
    }

    async isBlockchainFileExsist(){
      try {
        let  isExsiste =await fs.existsSync(BLOCKCHAIN_FILE,(err)=>{
          if(err){
            console.log(err);
            throw err;
          }
        }); 
        return isExsiste;
      }catch(err) {
        console.log("Error in reading the blockchain file");
        return false;
      }
    }
 
    
}

module.exports = BlockchainFileWriter; 