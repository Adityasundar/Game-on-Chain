import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Client } from 'xrpl';

function App() {
  const [client, setClient] = useState(null);
  const [test_wallet, setTestWallet] = useState(null);
  const [response, setResponse] = useState(null);

  

  const showAccountInfo = async () => {
    const MY_SERVER = "wss://s.altnet.rippletest.net:51233";
    const client =  new Client(MY_SERVER);
    await client.connect();

      // Create a wallet and fund it with the Testnet faucet:
    const fund_result = await client.fundWallet()
    const test_wallet = fund_result.wallet
    console.log(fund_result)

    const accountResponse = await client.request({
      "command": "account_info",
      "account": test_wallet.address,
      "ledger_index": "validated"
    });
    console.log(accountResponse); // Correctly logging the response
    setResponse(accountResponse);
    await client.disconnect()
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={showAccountInfo}>
          Click me!
        </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
