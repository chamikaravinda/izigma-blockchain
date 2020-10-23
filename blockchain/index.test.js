const Blockchain = require("./index");

describe("Blockchain", () => {
  let bc, bc2;

  beforeAll(async () => {
    bc = new Blockchain();
    await bc.addGenesisBlock();
    bc2 = new Blockchain();
    await bc2.addGenesisBlock();
    await bc2.replaceChain(bc.chain); //To make the 2 chains look like same from different nodes
  });

  it("test initial chains are equal ", async () => {
    expect(bc.chain).toEqual(bc2.chain);
  });

  it("is the chain exists", async () => {
    expect(await bc.isBlockchainExsist()).toBeTruthy();
  });

  it("starts with the genisis block", async () => {
    expect(bc.chain[0].lastHash).toEqual("0");
  });

  it("add a new block", async () => {
    const data = "foo";
    await bc.addBlock(data);
    expect(bc.chain[bc.chain.length - 1].data).toEqual(data);
  });

  it("validates a valid chain", async () => {
    await bc2.addBlock("foo");
    expect(await bc.isValidChain(bc2.chain)).toBeTruthy();
  });

  it("invalidates a chain with a corrupt genesis block", async () => {
    await bc2.getChain();
    bc2.chain[0].data = "Bad data";
    expect(await bc.isValidChain(bc2.chain)).not.toBeTruthy();
  });

  it("invalidatesa corrupt chain", async () => {
    await bc2.addBlock("foo");
    bc2.chain[1].data = "Not foo";
    expect(await bc.isValidChain(bc2.chain)).toBe(false);
  });

  it("replace the chain with a valid chain ", async () => {
    await bc2.addBlock("goo");
    await bc.replaceChain(bc2.chain);
    await bc2.getChain();
    await bc.getChain();
    expect(bc.chain).toEqual(bc2.chain);
  });

  it("does not replace the chain with one of less than or equal to length", async () => {
    bc2.chain = await bc2.getChain();
    await bc.addBlock("foo");
    await bc.replaceChain(bc2.chain);
    expect(bc.chain).not.toEqual(bc2.chain);
  });
});
