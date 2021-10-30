import React, { useEffect, useState } from "react";
import { ethers, Contract, BigNumber } from "ethers";
import {
  CharacterData as BossData,
  CharacterContractData as BossContractData,
  CONTRACT_ADDRESS,
  PlayableCharacterData,
  transformCharacterData,
} from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({
  characterNFT,
  setCharacterNFT,
}: {
  characterNFT: PlayableCharacterData;
  setCharacterNFT: React.Dispatch<React.SetStateAction<PlayableCharacterData>>;
}) => {
  // State
  const [gameContract, setGameContract] = useState<Contract>(null!);
  const [boss, setBoss] = useState<BossData>(null!);
  const [attackState, setAttackState] = useState("");

  const fetchBoss = async () => {
    const bossTxn: BossContractData = await gameContract.getBigBoss();
    console.log("Boss:", bossTxn);
    setBoss(transformCharacterData(bossTxn));
  };

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");
      }
    } catch (error) {
      console.error("Error attacking boss:", error);
      setAttackState("");
    }
  };

  const onAttackComplete = (newBossHp: BigNumber, newPlayerHp: BigNumber) => {
    const bossHp = newBossHp.toNumber();
    const playerHp = newPlayerHp.toNumber();

    console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

    /*
     * Update both player and boss Hp
     */
    setBoss((prevState) => {
      return { ...prevState, hp: bossHp };
    });

    setCharacterNFT((prevState: PlayableCharacterData) => {
      return { ...prevState, hp: playerHp };
    });
  };

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
      console.log("Ethereum object not found");
    }
  }, []);

  // UseEffects
  useEffect(() => {
    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }

    /*
     * Make sure to clean up this event when this component is removed
     */
    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract]);

  return (
    <div className="arena-container">
      {/* Replace your Boss UI with this */}
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
        </div>
      )}

      {/* Replace your Character UI with this */}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
