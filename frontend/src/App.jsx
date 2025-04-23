import { useEffect, useState } from "react";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("http://localhost:4000/balance");
        const data = await res.json();
        setAccount(data.account);
        setBalance(data.balance);
      } catch (err) {
        console.error("Could not fetch balance:", err);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Lottery DApp (Safe Version)</h1>
      {account && <p><strong>Account:</strong> {account}</p>}
      {balance ? (
        <p><strong>Balance:</strong> {balance} ETH</p>
      ) : (
        <p>Loading balance...</p>
      )}
    </div>
  );
}

export default App;
