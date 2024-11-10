import "./styles/App.css";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import _ from "lodash";


import * as states from "./recoil/atoms";


import {
  allCoinState,
  currentDiceState,
  currentPlayerState,
  currentPlayersListState,
} from "./recoil/atoms";

import HomeCenter from "./components/homeCenter";
import StepsGrid from "./components/stepsGrid";
import HomeBox from "./components/homeBox";
import GameSetup from "./components/gameSetup";
import { colorMap, moves, playerOrder } from "./config/constants";
import Walletinput from "./components/walletInput";

function Emulation() {
  const [currentPlayer, setCurrentPlayer] = useRecoilState(
    states.currentPlayerState
  );
  const [diceState, setDiceState] = useRecoilState(states.currentDiceState);
  const [blockState, setBlockState] = useRecoilState(states.allBlockState);
  const [coinState, setCoinState] = useRecoilState(states.allCoinState);
  const playersList = useRecoilValue(states.currentPlayersListState);

  // useEffect(() => {
  //   console.log(JSON.stringify({ blockState, coinState }, 0, 2));
  // }, [JSON.stringify(coinState), JSON.stringify(blockState)]);

  return (
    <div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <button
          key={i}
          onClick={() => {
            setDiceState({
              num: i,
              isLocked: false,
              lastRolledBy: currentPlayer,
            });
          }}
        >
          {i}
        </button>
      ))}
      <br />
      {playersList.map((elem, i) => (
        <button
          key={i}
          onClick={() => {
            setCurrentPlayer(elem);
          }}
          style={{ backgroundColor: elem }}
        >
          {elem}
        </button>
      ))}
      <div>
        <span>Enter (eg; p1-t40): </span>
        <input
          type="text"
          onKeyUp={({ code, currentTarget: { value } }) => {
            if (code === "Enter") {
              if (value.match(/^[pyrt][0-3]-[pyrt]\d{2}$/)) {
                const [coinKey, boxKey] = value.split("-");
                const parent = colorMap[coinKey[0]];
                if (!playersList.includes(parent)) return;
                const oldPosition = coinState[parent][coinKey].position;

                setCoinState({
                  ...coinState,
                  [parent]: {
                    ...coinState[parent],
                    [coinKey]: { position: boxKey, isTurnAvailable: false },
                  },
                });

                const oldBlockState = _.cloneDeep(blockState);

                oldPosition &&
                  !oldPosition.includes("home") &&
                  oldBlockState[oldPosition].splice(
                    oldBlockState[oldPosition].indexOf(coinKey),
                    1
                  );

                setBlockState({
                  ...oldBlockState,
                  [boxKey]: [
                    ...new Set([...(oldBlockState[boxKey] || []), coinKey]),
                  ],
                });
              } else alert("Wrong input!");
            }
          }}
        ></input>
      </div>
    </div>
  );
}



function App() {
  const playersList = useRecoilValue(states.currentPlayersListState);

  const xrpl = require("xrpl")
  const cc = require('five-bells-condition')
  const sha256 = require('js-sha256')

  const createEscrow = async () => {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    const wallet = await xrpl.Wallet.fromSeed("sEd7Tg5whs68dSuSCAg6pHbJ75E5GxQ");
    const amount = 1000000
    const preimageData = "player 1 wins";
    const myFulfillment = new cc.PreimageSha256();
    myFulfillment.setPreimage(sha256(preimageData));
    const conditionHex = myFulfillment.getConditionBinary().toString('hex').toUpperCase();

    let finishAfter = new Date((new Date().getTime() / 1000) + 120); // 2 minutes from now
    finishAfter = new Date(finishAfter * 1000);

    const escrowCreateTransaction = {
      "TransactionType": "EscrowCreate",
      "Account": "sEd7Tg5whs68dSuSCAg6pHbJ75E5GxQ",
      "Destination": "sEdVwgLxdnLgvYk6n9JEDYjdyhSfAqB",
      "Amount": amount, //drops XRP
      "DestinationTag": 2023,
      "Condition": conditionHex,
      "Fee": "12",
      "FinishAfter": xrpl.isoTimeToRippleTime(finishAfter.toISOString()),
    };

    xrpl.validate(escrowCreateTransaction);

    const response  = await client.submitAndWait(escrowCreateTransaction, { wallet });

  }

  const finishEscrow = async () => {
    const seed = "sEd7Tg5whs68dSuSCAg6pHbJ75E5GxQ"; // Test seed. Don't use
    const offerSequence = null;
    const condition = "";
    const fulfillment = "";
    try {
      // Connect ----------------------------------------------------------------
      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
  
      // Prepare wallet to sign the transaction ---------------------------------
      const wallet = await xrpl.Wallet.fromSeed(seed);
      console.log("Wallet Address: ", wallet.address);
      console.log("Seed: ", seed);
  
      if((!offerSequence)|| (condition === "" || fulfillment === "")){
          throw new Error("Please specify the sequence number, condition and fulfillment of the escrow you created");
      };
  
      const escrowFinishTransaction = {
          "Account": wallet.address,
          "TransactionType": "EscrowFinish",
          "Owner": wallet.address,
          // This should equal the sequence number of the escrow transaction
          "OfferSequence": offerSequence,
          // Crypto condition that must be met before escrow can be completed, passed on escrow creation
          "Condition": condition,
          // Fulfillment of the condition, passed on escrow creation
          "Fulfillment": fulfillment,
      };
  
      xrpl.validate(escrowFinishTransaction);
  
      // Sign and submit the transaction ----------------------------------------
      console.log('Signing and submitting the transaction:', JSON.stringify(escrowFinishTransaction, null,  "\t"));
      const response  = await client.submitAndWait(escrowFinishTransaction, { wallet });
      console.log(`Finished submitting! ${JSON.stringify(response.result, null,  "\t")}`);
  
      await client.disconnect();
  
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <GameSetup />
      <div className="App">
        <div className="boardWrapper">
          <div className="innerRow">
            <HomeBox parent="palegreen" />
            <StepsGrid parent="yellow" adjacentDirection="leftOrTop" />
            <HomeBox parent="yellow" />
          </div>
          <div className="innerRow">
            <StepsGrid
              style={{ transform: "rotate(90deg)" }}
              parent="palegreen"
              adjacentDirection="rightOrBottom"
            />
            <HomeCenter />
            <StepsGrid
              style={{ transform: "rotate(90deg)" }}
              parent="royalblue"
              adjacentDirection="leftOrTop"
            />
          </div>
          <div className="innerRow">
            <HomeBox parent="tomato" />
            <StepsGrid parent="tomato" adjacentDirection="rightOrBottom" />
            <HomeBox parent="royalblue" />
          </div>
        </div>
        <br />
        {/* {process.env.NODE_ENV === "development" && <Emulation />} */}
        <div style={{marginTop: '50px'}}>
          {playersList.map((player, i) => (
            <div>
              <Walletinput playerColour={player}/>
              <br />
            </div>
          ))}
          <button onClick={createEscrow}>Create Escrow</button>
          <button onClick={finishEscrow}>Finish Escrow</button>
        </div>
      </div>
    </div>
  );
}

export default App;