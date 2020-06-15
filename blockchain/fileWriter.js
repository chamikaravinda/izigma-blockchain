const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');



class BlockchainFileWriter{

    async writeGenesisBlock(block){
      try{
        
        const data = {
            hash : block.hash,
            lastHash : block.lastHash,
            timestamp : block.timestamp,
            nonce : block.nonce,
            difficulty : block.difficulty,
            data: block.data
        }
        
        var writer = csvWriter()            
        writer.pipe(fs.createWriteStream('blockchain.csv', {flags: 'a'}))
        writer.write(data)
        writer.end()
        console.log("Genesis block added...");
      }catch(e){
        console.log("Error in creating the genesis block");
        console.log("Error : " +e);
      }      
    }
 
    async writeToFile(block){
          try{
            
            const data = {
              hash : block.hash,
              lastHash : block.lastHash,
              timestamp : block.timestamp,
              nonce : block.nonce,
              difficulty : block.difficulty,
              data: block.data
          }
            
            var writer = csvWriter({sendHeaders: false})            
            writer.pipe(fs.createWriteStream('blockchain.csv', {flags: 'a'}))
            writer.write(data)
            writer.end()
            console.log("New block added...");
          }catch(e){
            console.log("Error in creating the block");
            console.log("Error : " +e);
          }      
    }

    async readFromFile(){
      return new Promise((resolve, reject) => {
        let blockchain = [];
        fs.createReadStream('blockchain.csv')
        .pipe(csv())
        .on('data', (row) => {
          blockchain.push(row);
        }).on('error', e => {
          console.log("Error in reading the blockchain");
          console.log("Error : " +e);
          reject(e);
        }).on('end', ()=> {
          resolve(blockchain);
        });
      });
    }

    async isBlockchainFileExsist(){
      try {
        let  isExsiste =await fs.existsSync('blockchain.csv',(err)=>{
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