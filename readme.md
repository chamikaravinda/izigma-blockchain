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
    const DIFFICULTY = 4;
    const MINE_RATE = 3000;
    const INITIIAL_BALANCE = 10;
    module.exports = { DIFFICULTY,MINE_RATE };
    
    ```

    Here the DIFFICULTY attribute is the initial difficulty for the proof of work consesus.

    MINE_RATE is the how often a block is created in the mine in mille seconds  

### Example Code 

```const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('izigma-blockchain');
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app =  express();
let chain = new Blockchain();

app.use(bodyParser.json());

app.get('/blocks',async (req,res)=>{
    let blockchain =[];
    blockchain =  await chain.getChain() 
    res.json(blockchain);
});

app.post('/mine',async (req,res)=>{
    const block =await chain.addBlock(req.body.data);
    res.json('Block added succesfully..');
})

app.listen(HTTP_PORT, async () => {
    let check = await chain.isBlockchainExsist();

    if(!check){
        await chain.addGenesisBlock()
    }
    
    console.log(`Listeing on port ${HTTP_PORT}`);
});             
```
 


 


