import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Client, Wallet } from 'xrpl';

function App() {
  const [client, setClient] = useState(null);
  const [test_wallet, setTestWallet] = useState(null);
  const [response, setResponse] = useState(null);

  

  const showAccountInfo = async () => {
    const MY_SERVER = "ws://localhost:3000/";
    const client =  new Client(MY_SERVER);
    await client.connect();


    const test_wallet =  Wallet.generate();



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
