# izigma-blockchain

This is a blochain framework to use with node servers 

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