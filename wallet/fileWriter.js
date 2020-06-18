const fs = require("fs");
const ChainUtil =  require('../chain-util');
const {WALLET_FILE} = require('../common-constant');


class WalletFileWriter{

    async readFromWallet(){
        let data=await fs.readFileSync(WALLET_FILE, 'utf8', function(err) {
            if(err){
                if (err.code === 'ENOENT') {
                    console.log('Create the wallet to read the wallet data...');
                }else{
                    console.log('Error in retriving the wallet data...');
                }
            }
        });
       
        let walletData = JSON.parse(data);
        return walletData; 
    }

    async writeToWallet(){
        let  isExsiste =await fs.existsSync(WALLET_FILE,(err)=>{
            if(err){
                console.log('Error in creating the wallet.Please try again...');
                throw err;
            }
        }); 

        if(!isExsiste){

            let keyPair=ChainUtil.genKeyPair();
            let publicKey=keyPair.getPublic().encode('hex');
            
            let data = {
                keyPair:keyPair,
                publicKey:publicKey
            }

            fs.writeFile(WALLET_FILE,JSON.stringify(data,null,2),'utf8', (err) => {
                if (err) console.log('Error in creating the wallet.Please try again...');
            });
       }
    }

    async getKeyPair(){
        let data = await this.readFromWallet();
        return data.keyPair; 
    }
    
    async getPublicKey(){
        let data = await this.readFromWallet();
        return data.publicKey; 
    }
}

module.exports = WalletFileWriter;