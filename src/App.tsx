import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import {
  CONTRACT_ADDRESS,
  transformCharacterData,
  CharacterData,
  PlayableCharacterData,
  CharacterContractData,
} from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";

// Components
import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const DEV_HANDLE = "carlosgusol";
const DEV_LINK = `https://twitter.com/${DEV_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState<PlayableCharacterData>(
    null!
  );
  /*
   * Start by creating a new action that we will run on component load
   */
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: "eth_accounts" });

        /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * The function we will call that interacts with out smart contract
   */
  const fetchNFTMetadata = async () => {
    try {
      console.log("Checking for Character NFT on address:", currentAccount);
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn: CharacterContractData = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn) as PlayableCharacterData);
      } else {
        console.log("No character NFT found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  // Render Methods
  const renderContent = () => {
    /*
     * Scenario #1: No accoutn connected
     */
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://c.tenor.com/Tibn6ocZqWMAAAAC/skeleton.gif"
            alt="Skeleton Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
      /*
       * Scenario #2:  No NFT selected
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">
            💀 <span className="gradient-text">Metaverse Monsters</span> 💀
          </p>
          <p className="sub-text">
            Team up to protect the Metaverse from Skeleton!
          </p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}  `}</a>
          <a
            className="footer-text"
            style={{ marginLeft: "8px" }}
            href={DEV_LINK}
            target="_blank"
            rel="noreferrer"
          >{`  by @${DEV_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
