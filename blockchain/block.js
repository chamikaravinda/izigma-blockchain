const ChainUtil = require('../chain-util');
const { CONFIG_FILE } = require('../common-constant');
const  {DIFFICULTY,MINE_RATE} = require(CONFIG_FILE);

class Block{

    constructor(timestamp,lastHash,hash,data,nonce,difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString(){
        return `Block - 
            Timestamp  : ${this.timestamp}
            Last Hash  : ${this.lastHash}
            Hash       : ${this.hash}
            Nonce      : ${this.nonce}
            Difficulty : ${this.difficulty}
            Data       : ${this.data}
        `
    }

    static genesis() {
        const genTimestamp = Date.now();
        const genLasthash='0';
        const genData = [];
        const genNonce = 0;
        const genDifficulty = DIFFICULTY;
        const genHash = Block.hash(genTimestamp,genLasthash,genData,genNonce,genDifficulty);
        return new this(genTimestamp,genLasthash,genHash,genData,genNonce,genDifficulty);
    }

    static mineBlock(lastBlock,data){

        let hash,timestamp;
        const lastHash = lastBlock.hash;
        let {difficulty} = lastBlock;
        let nonce = 0;
        
        do{
            nonce++;
            timestamp = Date.now();
            difficulty= Block.adjustDifficulty(lastBlock,timestamp);
            hash= Block.hash(timestamp,lastHash,data,nonce,difficulty);
        }while(hash.substring(0,difficulty) != '0'.repeat(difficulty));

        return new this(timestamp,lastHash,hash,data,nonce,difficulty);
    }  

    static hash(timestamp,lastHash,data,nonce,difficulty){
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block){ 
        const {timestamp,lastHash,data,nonce,difficulty} = block;
        return Block.hash(timestamp,lastHash,data,nonce,difficulty);
    }

    
    static adjustDifficulty(lastBlock,currentTime){
        let{difficulty} = lastBlock;
        difficulty = parseInt(lastBlock.timestamp) + parseInt(MINE_RATE) > parseInt(currentTime)? parseInt(difficulty)+1: parseInt(difficulty)-1;
        if(difficulty<1){
            return 1;
        }else{
            return difficulty;
        }
    }

}

module.exports = Block;
