import React, { useState, useEffect } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, transformCharacter } from "../../constants";
import EpicNftGame from "../../utils/EpicNftGame.json"
import LoadingIndicator from "../LoadingIndicator/index";


const SelectCharacterComponent = ({ setCharacterNft }) => {
    const [characters, setCharacters] = useState([])
    const [gameContract, setGameContract] = useState(null)
    const [mintingCharacter, setMintingCharacter] = useState(false)

    // functions
    const getGameContract = () => {
        try {
            const { ethereum } = window;
            if (!ethereum ) {
                console.log('Install Metamask')
                return
            }

            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract
            (
                CONTRACT_ADDRESS, 
                EpicNftGame.abi, 
                signer
            )

            setGameContract(contract)   
        } catch (error) {
            console.log(error)
            
        }
    }

    const getCharacters = async () => {
        try {
            console.log('Getting all characters to mint')

            const txn = await gameContract.getAllCharacters()
            console.log('Character Transaction:', txn)

            const gameCharacters = txn.map(character => transformCharacter(character))
            setCharacters(gameCharacters)
        } catch (error) {
            console.log(error)

        }
    }

    const mintCharacterNFTAction = async (characterIndex) => {
        try {
            if (gameContract) {

                // Show our loading indicator
                setMintingCharacter(true)

                console.log("Minting in progress")
                const mintTxn = await gameContract.mintCharacter(characterIndex)
                await mintTxn.wait()
                console.log("Mint was successful", mintTxn)

                // Hide our loading indicator when minting is finished
                setMintingCharacter(false)
            }
        } catch (error) {
            console.warn("MintCharacter Error", error)

            // Hide our loading indicator if something is wrong
            setMintingCharacter(false)
        }
    }

    const renderCharacters = () => 
        characters.map((char, index) => (
            <div className="character-item" key={char.name}>
                <div className="name-container">
                    <p>{char.name}</p>
                </div>
                <img src={char.imageURI} alt={char.name}/>
                <button 
                    type="button" 
                    className="character-mint-button"
                    onClick={() => mintCharacterNFTAction(index)}
                >
                    {`Mint ${char.name}`}
                </button>
            </div>
        ))
    
    

    // const renderCharacters = () =>
    //     characters.map((character, index) => (
    //         <div className="character-item" key={character.name}>
    //             <div className="name-container">
    //                 <p>{character.name}</p>
    //             </div>
    //             <img src={character.imageURI} alt={character.name} />
    //             <button
    //                 type="button"
    //                 className="character-mint-button"
    //                 onClick={mintCharacterNFTAction(index)}
    //             >{`Mint ${character.name}`}</button>
    //         </div>
    //     ));

    useEffect(() => {
        // if(!gameContract) {
            getGameContract()
        // }
    }, [])


    
    // Add a callback method that will fire when this event is received
   
    const onCharacterNftMint = async (sender, tokenId, characterIndex) => {
        console.log(
            `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
        );

        alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        
        // Once our character NFT is minted we can fetch the metadata from our contract
        // and set it in state to move onto the Arena
        if(gameContract) {
            const characterNft = await gameContract.checkIfUserHasNft()
            console.log("Character Nft:", characterNft)
            setCharacterNft(transformCharacter(characterNft))
        }
    }



    useEffect(() => {
        if(gameContract) {
            getCharacters()

            gameContract.on("CharacterMinted", onCharacterNftMint)
        }
        return () => {
            if(gameContract) {
                gameContract.off("CharacterMinted", onCharacterNftMint)
            }
        }
        
    }, gameContract, onCharacterNftMint)



    return (
        <div className="select-character-container">
            <h2>Mint your Character for combat!</h2>
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}

            {mintingCharacter &&(
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator/>
                        <p>Minting in progress...</p>
                    </div>
                    <img 
                        src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                        alt="Minting Loading Indicator"
                    />
                </div>



            )}
        </div>
    )
}

export default SelectCharacterComponent;