import React, { useEffect, useState } from 'react'

const Walletinput = (playerColour) => {

    const xrpl = require("xrpl")

    const [address, setAddress] = useState("")
    const connectToWallet = async () => {
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()
        try {
            const test_wallet = xrpl.Wallet.fromSeed(address)
            const response = await client.request({
                "command": "account_info",
                "account": test_wallet.address,
                "ledger_index": "validated"
              })
              console.log(response)
        } catch(error) {
            console.log(error)
        }
    }

  return (
    <div className='grid-2'> 
      <input type='text' style={{width: '200px'}} placeholder={`Player ${playerColour.playerColour}, enter wallet address`} value={address} onChange={(e) => setAddress(e.target.value)} />
      <button style={{marginLeft: '13px'}} onClick={connectToWallet}>Connect</button>
    </div>
  )
}

export default Walletinput
