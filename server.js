// server.js
const express = require("express");
const cors    = require("cors");
const { ethers } = require("ethers");

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ─── connect to Ganache ─────────────────────────────────────────────────────
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const accounts = await provider.listAccounts();

  // ─── constants ───────────────────────────────────────────────────────────────
  const ENTRY_FEE = ethers.utils.parseEther("0.5");           // 0.5 ETH
  const GAS_FEE   = ethers.utils.parseUnits("1.4", "gwei");   // 1.4 Gwei

  // ─── in‐memory state ─────────────────────────────────────────────────────────
  let balances = {};    // address → BigNumber (wei)
  let guesses  = [];    // { address, guess: number }
  let pool     = ethers.BigNumber.from(0);
  let closed   = false;
  let round    = 1;
  let eligible = [...accounts];   // who may play this round

  // init each account to 5 ETH
  for (const a of accounts) {
    balances[a] = ethers.utils.parseEther("5.0");
  }

  // ─── routes ─────────────────────────────────────────────────────────────────

  // list all accounts (for balance table)
  app.get("/accounts", (req, res) => {
    res.json(accounts);
  });

  // list just the eligible accounts this round
  app.get("/eligible", (req, res) => {
    res.json(eligible);
  });

  // get the current round
  app.get("/round", (req, res) => {
    res.json({ round });
  });

  // fetch all balances
  app.get("/balances", (req, res) => {
    const out = accounts.map(a => ({
      address: a,
      balance: ethers.utils.formatEther(balances[a])
    }));
    res.json(out);
  });

  // fetch a single balance
  app.get("/balance", (req, res) => {
    const { address } = req.query;
    if (!(address in balances)) {
      return res.status(404).json({ error: "Unknown address" });
    }
    res.json({ balance: ethers.utils.formatEther(balances[address]) });
  });

  // fetch all guesses
  app.get("/guesses", (req, res) => {
    res.json(guesses);
  });

  // submit a guess
  app.post("/guess", (req, res) => {
    if (closed) {
      return res.status(400).json({ error: "Lottery is closed" });
    }
    const { address, guess } = req.body;
    const n = parseInt(guess, 10);

    if (!eligible.includes(address)) {
      return res.status(400).json({ error: "Not eligible this round" });
    }
    if (!balances[address]) {
      return res.status(400).json({ error: "Unknown address" });
    }
    if (!Number.isInteger(n) || n < 1 || n > 1000) {
      return res.status(400).json({ error: "Guess must be 1–1000" });
    }
    if (guesses.find(g => g.address === address)) {
      return res.status(400).json({ error: "Already guessed" });
    }
    // ─── new duplicate-guess check ─────────────────────────────────────────────
    if (guesses.find(g => g.guess === n)) {
      return res.status(400).json({ error: "That number has already been guessed" });
    }

    const total = ENTRY_FEE.add(GAS_FEE);
    if (balances[address].lt(total)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // deduct fee + gas from balance, add entry fee to pool
    balances[address] = balances[address].sub(total);
    pool = pool.add(ENTRY_FEE);
    guesses.push({ address, guess: n });

    res.json({ success: true });
  });

  // close and pick winner
  app.post("/close", (req, res) => {
    if (closed) {
      return res.status(400).json({ error: "Already closed" });
    }
    closed = true;

    // draw target 0–1000
    const target = Math.floor(Math.random() * 1001);

    // find closest
    let best = null;
    for (const g of guesses) {
      const diff = Math.abs(g.guess - target);
      if (!best || diff < best.diff) {
        best = { ...g, diff };
      }
    }

    let winner = null, winningGuess = null;
    if (best) {
      winner = best.address;
      winningGuess = best.guess;
      balances[winner] = balances[winner].add(pool);
    }

    const poolEth = ethers.utils.formatEther(pool);

    // bump round counter (we’ll actually clear state in /new-round)
    round++;

    res.json({ target, winner, guess: winningGuess, pool: poolEth, round });
  });

  // start next round: clear guesses + pool + closed flag + update eligible list
  app.post("/new-round", (req, res) => {
    // only those who guessed last time can play again
    eligible = Array.from(new Set(guesses.map(g => g.address)));
    // clear old state
    guesses = [];
    pool    = ethers.BigNumber.from(0);
    closed  = false;
    res.json({ ok: true, eligible });
  });

  // reset everything back to round 1 + all balances to 5 ETH
  app.post("/reset", (req, res) => {
    guesses   = [];
    pool      = ethers.BigNumber.from(0);
    closed    = false;
    round     = 1;
    eligible  = [...accounts];
    for (const a of accounts) {
      balances[a] = ethers.utils.parseEther("5.0");
    }
    res.json({ success: true });
  });

  // ─── start server ─────────────────────────────────────────────────────────────
  app.listen(4000, () => {
    console.log("🚀 server listening on http://localhost:4000");
  });
}

main().catch(console.error);
