const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');
const { BLOCKCHAIN_FILE } = require('../common-constant');



class BlockchainFileWriter{

    async writeGenesisBlock(block){

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

      fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(chain,null,2), 'utf8',(err) => {
        if (err){
          console.log('Error in creating the genesis block...');
        }else{
          console.log("Genesis block added...");
        }
      });

    }
 
    async writeToFile(block){
      const data = {
          hash : block.hash,
          lastHash : block.lastHash,
          timestamp : block.timestamp,
          nonce : block.nonce,
          difficulty : block.difficulty,
          data: block.data
      }

      let chain = await fs.readFileSync(BLOCKCHAIN_FILE, 'utf8', function(err) {
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
      chain.push(data);
      fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(chain,null,2), 'utf8',(err) => {
        if (err){
          console.log('Error in creating the genesis block...');
        }else{
          console.log("Genesis block added...");
        }
      });    
    }

    async readFromFile(){
      let chain = await fs.readFileSync(BLOCKCHAIN_FILE, 'utf8', function(err) {
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
        console.log("Error : " +e);
        return false;
      }
    }

}

module.exports = BlockchainFileWriter; 