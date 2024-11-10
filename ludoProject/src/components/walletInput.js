import React, { useState } from 'react'

const Walletinput = (playerColour) => {

    const [address, setAddress] = useState("")

  return (
    <div className='grid-2'> 
      <input type='text' style={{width: '200px'}} placeholder={`Player ${playerColour.playerColour}, enter wallet address`} value={address} onChange={(e) => setAddress(e.target.value)} />
      <button style={{marginLeft: '13px'}} onClick={() => {
        console.log(playerColour)
      }}>Connect</button>
    </div>
  )
}

export default Walletinput
