const fs = require("fs");
const crypto = require("crypto")
const {WALLET_FILE} = require('../common-constant');


class WalletFileWriter{

    async isExsiste(){
        let  isExsiste = await fs.existsSync(WALLET_FILE,(err)=>{
            if(err){
                console.log('Error in creating the wallet.Please try again...');
                throw err;
            }
        }); 
        return isExsiste;
    }

    async readFromWallet(){
        try{
            let data = fs.readFileSync(WALLET_FILE, 'utf8');
            let walletData = JSON.parse(data);
            return walletData; 
        }catch(err){
                if(err){
                    if (err.code === 'ENOENT') {
                        console.log('Create the wallet to read the wallet data...');
                    }else{
                        console.log('Error in retriving the wallet data...');
                }
            }
        }
    }

    async writeToWallet(){
        const { publicKey, privateKey }  = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,

            publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
            },

            privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'passphrase'
            }
        });
                
        let data = {
            publicKey:publicKey,    	
            privateKey:privateKey
        }

        await fs.writeFileSync(WALLET_FILE,JSON.stringify(data,null,2),'utf8', (err) => {
            if (err) console.log('Error in creating the wallet.Please try again...');
        });
        
        return data;
    }
}

module.exports = WalletFileWriter;