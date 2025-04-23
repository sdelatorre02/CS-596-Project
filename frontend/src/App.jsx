import { useEffect, useState } from "react";
import { ethers } from "ethers";

const BACKEND_URL = "http://localhost:4000";
const TICKET_PRICE_GWEI = "10";

function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [guess, setGuess] = useState("");
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const res = await fetch(`${BACKEND_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
      if (data.length > 0) setSelectedAccount(data[0].address);
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!selectedAccount) return;
      const res = await fetch(`${BACKEND_URL}/balance?address=${selectedAccount}`);
      const data = await res.json();
      setBalance(data.balance);
    };
    fetchBalance();
  }, [selectedAccount]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlayers();
      fetchWinner();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch(`${BACKEND_URL}/players`);
    const data = await res.json();
    setPlayers(data);
  };

  const fetchWinner = async () => {
    const res = await fetch(`${BACKEND_URL}/winner`);
    const data = await res.json();
    if (data.winner) setWinner(data.winner);
  };

  const submitGuess = async () => {
    if (!guess || isNaN(guess) || guess < 1 || guess > 10000) {
      alert("Guess must be a number between 1 and 10000");
      return;
    }
    try {
      await fetch(`${BACKEND_URL}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: selectedAccount, guess }),
      });
      setGuess("");
      fetchPlayers();
    } catch (err) {
      alert("Failed to enter lottery");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Enter the Lottery</h1>
      <label>
        Choose account:
        <select
          value={selectedAccount || ""}
          onChange={(e) => setSelectedAccount(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          {accounts.map((acc) => (
            <option key={acc.address} value={acc.address}>
              {acc.address}
            </option>
          ))}
        </select>
      </label>
      <p><strong>Balance:</strong> {balance ?? "Loading..."} ETH</p>

      <input
        type="number"
        placeholder="Enter your guess (1–10000)"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        style={{ padding: 10, fontSize: 16, marginRight: 10 }}
      />
      <button onClick={submitGuess}>Submit Guess (10 Gwei)</button>

      {winner && (
        <div style={{ marginTop: 30, padding: 20, backgroundColor: "#e6ffe6", border: "1px solid #ccc" }}>
          <h2>Winner</h2>
          <p><strong>Address:</strong> {winner.address}</p>
          <p><strong>Guess:</strong> {winner.guess}</p>
        </div>
      )}

      <h2 style={{ marginTop: 40 }}>Players & Guesses</h2>
      {players.length === 0 ? (
        <p>No guesses yet.</p>
      ) : (
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player.address} guessed <strong>{player.guess}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
