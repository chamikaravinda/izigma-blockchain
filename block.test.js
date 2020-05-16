const Block =require('./block')

describe ('Block',() => {
 let data,lastBlock,block;
    beforeEach(()=>{
        data='test';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock,data);
     });

    it('sets the data of genesis block to empty array',()=>{
        expect(lastBlock.data.length).toBeLessThanOrEqual(0);
    });

    it('sets the `data` to match  the input',()=>{
        expect(block.data).toEqual(data);
    });

    it('sets the `lastHash` to match the hash of the last block',()=>{
        expect(block.lastHash).toEqual(lastBlock.hash);
    })

    it('generates a hash that matches the difficulty',()=>{
        expect(block.hash.substring(0,block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });

    it('lowers the difficulty for slowly mined blocks',()=>{
        expect(Block.adjustDIfficulty(block,block.timestamp+360000))
        .toEqual(block.difficulty-1);
    });

    it('raise the diffuculty for quickly mined blocks',()=>{
        expect(Block.adjustDIfficulty(block,block.timestamp+1))
        .toEqual(block.difficulty+1);
    })
}) 