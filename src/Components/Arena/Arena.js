import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacter } from '../../constants';
import myEpicGame from '../../utils/EpicNftGame.json';
import './Arena.css';

import LoadingIndicator from '../LoadingIndicator/index';


const Arena = ({characterNft, setCharacterNft}) => {
    // State
    const [gameContract, setGameContract] = useState(null);
    //   State that will hold our boss metadata
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState("")
    
    // Toast state management
    const [showToast, setShowToast] = useState(false);


    /*
        * Setup async function that will get the boss from our contract and sets in state
        */
    const fetchBoss = async () => {
        const bossTxn = await gameContract.getBigBoss();
        console.log('Boss:', bossTxn);
        setBoss(transformCharacter(bossTxn));
    };

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState("attacking")
                console.log("Attacking Boss .......")
                const attackTxn = await gameContract.attackBoss()
                await attackTxn.wait()
                console.log("Good Hit", attackTxn)
                setAttackState("hit")

                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false)
                }, 5000)
            }
        } catch (error) {
            console.log("Error Attacking Boss:", error)
            setAttackState("")
        }
    }

    const onAttackComplete = (newBossHp, newPlayerHp) => {
        const bossHp = newBossHp.toNumber()
        const playerHp = newPlayerHp.toNumber()

        console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

        setBoss((prevState) => {
            return {...prevState, hp:bossHp}
        })

        setCharacterNft((prevState) => {
            return { ...prevState, hp: playerHp }
        })

    }

    // UseEffects
    useEffect(() => {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            setGameContract(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    

    // UseEffects
    useEffect(() => {
        // fectch boss only when gameContract loads
        if (gameContract) {
            fetchBoss();

            gameContract.on("AttackComplete", onAttackComplete)
        }

        return(()=> {
            if(gameContract) {
                gameContract.off("AttackComplete", onAttackComplete)
            }
        })
    }, [gameContract]);

    return (
        <div className="arena-container">
            {/* Add your toast HTML right here */}
            {boss && characterNft && (
                <div id="toast" className={showToast ? 'show' : ''}>
                    <div id="desc">{`💥 ${boss.name} was hit for ${characterNft.attackDamage}!`}</div>
                </div>
            )}
            {/* Show Boss */}
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                        <h2>🔥 {boss.name} 🔥</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="attack-container">
                        <button className="cta-button" onClick={runAttackAction}>
                            {`💥 Attack ${boss.name}`}
                        </button>
                    </div>
                    {attackState === 'attacking' && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Attacking ⚔️</p>
                        </div>
                    )}
                </div>
            )}

            {/* Replace your Character UI with this */}
            {characterNft && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Your characterNft</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNft.name}</h2>
                                <img
                                    src={characterNft.imageURI}
                                    alt={`Character NFT ${characterNft.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNft.hp} max={characterNft.maxHp} />
                                    <p>{`${characterNft.hp} / ${characterNft.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`⚔️ Attack Damage: ${characterNft.attackDamage}`}</h4>
                            </div>
                        </div>
                    </div>
                    {/* <div className="active-players">
                        <h2>Active Players</h2>
                        <div 
                            className="players-list">
                            {renderActivePlayersList()}
                        </div>
                    </div>  */}
                </div>
            )}
        </div>
    );
};

export default Arena;