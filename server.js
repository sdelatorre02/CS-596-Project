const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

const abi = require("./frontend/src/contracts/LotteryABI.json");
const contractMeta = require("./frontend/src/contracts/ContractAddress.json");
const contract = new ethers.Contract(contractMeta.address, abi, provider);

// GET /accounts
app.get("/accounts", async (req, res) => {
  try {
    const accounts = await provider.listAccounts();
    const result = [];
    for (const address of accounts) {
      const balance = await provider.getBalance(address);
      result.push({ address, balance: ethers.utils.formatEther(balance) });
    }
    res.json(result);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// GET /balance?address=...
app.get("/balance", async (req, res) => {
  try {
    const balance = await provider.getBalance(req.query.address);
    res.json({ balance: ethers.utils.formatEther(balance) });
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// GET /players — returns list of { address, guess }
app.get("/players", async (req, res) => {
  try {
    const addresses = await contract.getPlayerAddresses();
    const guesses = await contract.getPlayerGuesses();
    const players = addresses.map((addr, i) => ({ address: addr, guess: guesses[i].toString() }));
    res.json(players);
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

// POST /enter — { address, guess }
app.post("/enter", async (req, res) => {
  const { address, guess } = req.body;
  if (!address || !guess) return res.status(400).json({ error: "Missing address or guess" });

  try {
    const signer = provider.getSigner(address);
    const contractWithSigner = contract.connect(signer);

    const tx = await contractWithSigner.joinLottery(guess, {
      value: ethers.utils.parseUnits("10", "gwei"),
      gasLimit: 1000000,
    });
    await tx.wait();
    res.json({ success: true });
  } catch (err) {
    console.error("Error entering lottery:", err);
    res.status(500).json({ error: "Failed to enter lottery" });
  }
});

// GET /winner — derive winner from last player if lottery closed
app.get("/winner", async (req, res) => {
  try {
    const addresses = await contract.getPlayerAddresses();
    const guesses = await contract.getPlayerGuesses();

    if (addresses.length < 10) {
      return res.json({ winner: null });
    }

    const lastIndex = addresses.length - 1;
    const winner = {
      address: addresses[lastIndex],
      guess: guesses[lastIndex].toString(),
    };

    res.json({ winner });
  } catch (err) {
    console.error("Error fetching winner:", err);
    res.status(500).json({ error: "Failed to fetch winner" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
