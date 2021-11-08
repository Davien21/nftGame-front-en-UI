import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import twitterLogo from './assets/twitter-logo.svg';
import funnyGif from "./assets/mortalkombat-kick.gif";

import SelectCharacterComponent from './Components/SelectCharacter/SelectCharacterComponent';
import Arena from "./Components/Arena/Arena"
import LoadingIndicator from './Components/LoadingIndicator';

import { CONTRACT_ADDRESS, transformCharacter } from "./constants"
import myEpicNftGame from "./utils/EpicNftGame.json"

import './App.css';

// Constants
const TWITTER_HANDLE = '@razor357901';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;




const App = () => {

  const [currentAccount, setCurrentAccount ] = useState(null);
  const [connected, setConnected] = useState(false)
  const [characterNft, setCharacterNft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  const checkIfWalletisConnected = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Please install Metamask")

        // We set isLoading here because we use return in the next line
        setIsLoading(false)
        return;
      } else {
        console.log("Metamask is available", ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"})

      if(accounts.length !== 0) {
        const account = accounts[0]
        console.log("User authorized account", account)

        setCurrentAccount(account)
      } else {
        console.log("User has not given access to accounts!")
      }
      
      // We release the state property after all the function logic
      setIsLoading(false)
    } catch (error) {
      console.log(error)
    }

  }

  const onAccountChange = () => {
    const { ethereum } = window;

    ethereum.on("accountsChanged", function (accounts) {
      console.log("New account connected:", accounts[0])  
      setCurrentAccount(accounts[0]);
        
    })
  }





  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Please install Metamask")
        return;
      } 

      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      console.log("Account connected", accounts[0])


      setCurrentAccount(accounts[0])
      setConnected(true)
    
      
    } catch (error) {
      console.log(error)
    }
  }

  const fecthNftMetadata = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNftGame.abi, signer)

      const txn = await nftContract.checkIfUserHasNft()

      if(txn.name) {
        console.log('user has a character nft', txn.name)
        setCharacterNft(transformCharacter(txn))

        //  Once we are done with all the fetching, set loading state to false
        setIsLoading(false)
      } else {
        console.log("User has no character to play with go and mint a character on the dashboard")
      }
    } catch (error) {
      console.log(error)
      
    }
  }

  const renderContent = () => {
    // If the app is currently loading, just render out LoadingIndicator
    if(isLoading) {
      return <LoadingIndicator/>
    }

    // If the app is finished loading, just render out below
    if(!currentAccount ) {
      return(
        <div className="connect-wallet-container">  
          <img src={funnyGif} alt="funny GIF" width="50%"/>
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              Connect Wallet To Get Started
            </button> 
        </div>
      )
    } 
    else if (currentAccount && !characterNft) {
      return (
        <SelectCharacterComponent setCharacterNft={setCharacterNft} />
      )

    }
    else if (currentAccount && characterNft) {
      return (
        <Arena characterNft={characterNft} setCharacterNft={setCharacterNft} />
      )
      
    }
  }

  



  useEffect(() => {

    // Anytime our component mounts, make sure to immiediately set our loading state = true
    setIsLoading(true)
    checkIfWalletisConnected();
    
  }, [])

  useEffect(() => {
    onAccountChange();
    
  }, [])

  useEffect(() => {
    if(currentAccount) {
      fecthNftMetadata();
    }
    
    
  }, [currentAccount])


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ NFT Combat ⚔️</p>
          <p className="sub-text">Team up to destroy the outworld!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
