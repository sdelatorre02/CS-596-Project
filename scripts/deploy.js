const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const abi = require("../frontend/src/contracts/LotteryABI.json");
const bytecode = fs.readFileSync(path.resolve(__dirname, "../frontend/src/contracts/LotteryBytecode.json"), "utf-8");

async function deploy() {
  const signer = provider.getSigner(0);
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.deployed();
  fs.writeFileSync(
    path.resolve(__dirname, "../frontend/src/contracts/ContractAddress.json"),
    JSON.stringify({ address: contract.address }, null, 2)
  );
  console.log("Contract deployed to:", contract.address);
}

deploy();