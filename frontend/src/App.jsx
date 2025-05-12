// src/App.jsx
import { useEffect, useState } from "react";

export default function App() {
  const [eligible,    setEligible]    = useState([]);
  const [balancesAll, setBalancesAll] = useState([]);
  const [round,       setRound]       = useState(1);
  const [guesses,     setGuesses]     = useState([]);
  const [selected,    setSelected]    = useState("");
  const [guess,       setGuess]       = useState("");
  const [balance,     setBalance]     = useState("0");
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");

  const API = "http://localhost:4000";

  // ─── initial data ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/eligible`)
      .then(r => r.json())
      .then(setEligible);
    fetch(`${API}/round`)
      .then(r => r.json())
      .then(j => setRound(j.round));
    fetchGuesses();
    fetchBalancesAll();
  }, []);

  // whenever user picks an address, fetch its balance
  useEffect(() => {
    if (!selected) return;
    fetch(`${API}/balance?address=${selected}`)
      .then(r => r.json())
      .then(j => setBalance(j.balance))
      .catch(() => setBalance("0"));
  }, [selected]);

  function fetchGuesses() {
    fetch(`${API}/guesses`)
      .then(r => r.json())
      .then(setGuesses);
  }

  function fetchBalancesAll() {
    fetch(`${API}/balances`)
      .then(r => r.json())
      .then(setBalancesAll);
  }

  // ─── actions ─────────────────────────────────────────────────────────────────

  async function submitGuess() {
    setError("");
    const n = parseInt(guess, 10);
    if (!selected || !n || n < 1 || n > 1000) {
      setError("Pick an account & enter 1–1000");
      return;
    }
    const res = await fetch(`${API}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: selected, guess: n })
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error);
    } else {
      setGuess("");
      fetchGuesses();
      fetchBalancesAll();
    }
  }

  async function closeLottery() {
    const j = await fetch(`${API}/close`, { method: "POST" })
      .then(r => r.json());
    setResult(j);
    setRound(j.round);
    fetchBalancesAll();
  }

  async function nextRound() {
    await fetch(`${API}/new-round`, { method: "POST" });
    // reload the new eligible list
    const list = await fetch(`${API}/eligible`).then(r => r.json());
    setEligible(list);
    // clear UI state
    setResult(null);
    setSelected("");
    setGuess("");
    setError("");
    fetchGuesses();
  }

  async function resetAll() {
    await fetch(`${API}/reset`, { method: "POST" });
    setResult(null);
    setRound(1);
    setSelected("");
    setGuess("");
    setError("");
    // reset eligible back to everyone
    const list = await fetch(`${API}/eligible`).then(r => r.json());
    setEligible(list);
    fetchGuesses();
    fetchBalancesAll();
  }

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>Enter the Lottery</h1>
      <p><strong>Round:</strong> {round}</p>

      <div>
        <label>
          Choose account:&nbsp;
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">-- pick --</option>
            {eligible.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <p>
        <strong>Your Balance:</strong> {balance} ETH<br/>
        <strong>Entry Fee:</strong> 0.5 ETH &nbsp;|&nbsp;
        <strong>Gas Fee:</strong> 1.4 Gwei
      </p>

      <div>
        <input
          type="number"
          min={1}
          max={1000}
          placeholder="1–1000"
          value={guess}
          onChange={e => setGuess(e.target.value)}
        />
        <button onClick={submitGuess} style={{ marginLeft: 8 }}>
          Submit Guess
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h2>Players &amp; Guesses</h2>
      {guesses.length === 0
        ? <p>No guesses yet.</p>
        : (
          <ul>
            {guesses.map(g => (
              <li key={g.address}>
                {g.address} → {g.guess}
              </li>
            ))}
          </ul>
        )
      }

      <div style={{ margin: "20px 0" }}>
        <button onClick={closeLottery}>Close Lottery</button>
        {result && (
          <button onClick={nextRound} style={{ marginLeft: 8 }}>
            Next Round
          </button>
        )}
        <button onClick={resetAll} style={{ marginLeft: 8 }}>
          Reset All
        </button>
      </div>

      {result && (
        <div style={{ marginBottom: 20 }}>
          <h2>🎉 Winner!</h2>
          <p><strong>Target:</strong> {result.target}</p>
          <p><strong>Winner:</strong> {result.winner}</p>
          <p><strong>Guess:</strong> {result.guess}</p>
          <p><strong>Pool:</strong> {result.pool} ETH</p>
        </div>
      )}

      <h2>All Balances</h2>
      <button onClick={fetchBalancesAll}>Refresh All Balances</button>
      <ul>
        {balancesAll.map(b => (
          <li key={b.address}>
            {b.address}: {b.balance} ETH
          </li>
        ))}
      </ul>
    </div>
  );
}
