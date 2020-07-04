Read Me 
# izigma-blockchain

This is a blockchain framework to use with node servers 

### configuration 

To use or test this library you need to add a configuration
file.

STEP 1 : Run the following command relevant to your 
operating system in the project directory

    windows :
    ```
    echo > izigma-config.js
    ```

    Linux :
    ```
    touch izigma-config.js
    ```
STEP 2 : Past the following code in the created file 

    ```
    const DIFFICULTY = 2;
    const MINE_RATE = 1000;
    const INITIAL_BALANCE = 500;
    const MINING_REWARD = 50;
    module.exports = { DIFFICULTY,MINE_RATE,INITIAL_BALANCE,MINING_REWARD};
    
    ```

    Here the DIFFICULTY attribute is the initial difficulty for the proof of work consesus.
    MINE_RATE is the how often a block is created in the mine in mille seconds.
    INITIAL_BALANCE hold the wallate balance of the node.
    And MINING_REWARD is the reward recives for the miner for doing mining works... 

### Example Code 

```
const express = require ('express');
const bodyParser = require('body-parser');
const Blockchain = require('izigma-blockchain');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const chain = new Blockchain();

app.use(bodyParser.json());

app.get('/blocks',async(req,res) =>{
    let blockchain = await chain.getChain();
    res.json(blockchain);
});

app.post('/mine',async(req,res) =>{
    const block = await chain.addBlock(req.body.data);
    console.log(`New block added : ${ block.toString()}`);
    
    let blockchain = await chain.getChain();
    
    res.redirect('/blocks');
});

app.get('/transactions',(req,res)=>{
    res.json(chain.getTransactionPool());
})

app.post('/transact',(req,res)=>{
    const {recipient, amount} = req.body;
    const transaction = chain.createTransaction(recipient,amount);
    res.redirect('/transactions');
});

app.get('/mine-transactions',(req,res)=>{
    const block = chain.mine();
    chain.clearTransactionPool();
    console.log(`New block added : ${block.toString()}`);
    res.redirect('/blocks');
});

app.get('/public-key',(req,res)=>{
    res.json({
        publicKey: chain.getPublicKey()
    });
})

app.listen(HTTP_PORT, async () => {
    let check = await chain.isBlockchainExsist();

    if(!check){
        await chain.addGenesisBlock()
    }
    
    console.log(`Listeing on port ${HTTP_PORT}`);
});    


```
 


 


