import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from './contracts/LotteryABI.json';

//TODO: PASTE THE CONTRACT ADDRESS HERE AFTER DEPLOYMENT
const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // Update after deploy

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      const prov = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
      const accs = await prov.listAccounts();
      const sig = prov.getSigner(accs[0]);
      const con = new ethers.Contract(CONTRACT_ADDRESS, abi, sig);

      setProvider(prov);
      setSigner(sig);
      setContract(con);
      setAccount(accs[0]);
    };
    init();
  }, []);

  const enter = async () => {
    const tx = await contract.enter({ value: ethers.utils.parseEther("1.0") });
    await tx.wait();
    alert("Entered lottery!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Lottery DApp</h1>
      {account && <p>Connected as: {account}</p>}
      <button onClick={enter}>Enter Lottery (1 ETH)</button>
    </div>
  );
}

export default App;
