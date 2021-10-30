import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { Contract, ethers, BigNumber } from "ethers";
import {
  CONTRACT_ADDRESS,
  transformCharacterData,
  CharacterData,
  PlayableCharacterData,
  CharacterContractData,
} from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import { Address } from "cluster";

const SelectCharacter = ({
  setCharacterNFT,
}: {
  setCharacterNFT: React.Dispatch<React.SetStateAction<PlayableCharacterData>>;
}) => {
  const [characters, setCharacters] = useState<PlayableCharacterData[]>([]);
  const [gameContract, setGameContract] = useState<Contract>(null!);

  const getCharacters = async () => {
    try {
      console.log("Getting contract characters to mint");

      /*
       * Call contract to get all mint-able characters
       */
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log("charactersTxn:", charactersTxn);

      /*
       * Go through all of our characters and transform the data
       */
      const characters: PlayableCharacterData[] = charactersTxn.map(
        (characterData: CharacterContractData) =>
          transformCharacterData(characterData)
      );

      /*
       * Set all mint-able characters in state
       */
      setCharacters(characters);
    } catch (error) {
      console.error("Something went wrong fetching characters:", error);
    }
  };

  const onCharacterMint = async (
    sender: Address,
    tokenId: BigNumber,
    characterIndex: BigNumber
  ) => {
    console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );

    /*
     * Once our character NFT is minted we can fetch the metadata from our contract
     * and set it in state to move onto the Arena
     */
    if (gameContract) {
      // const characterNFT = await gameContract.checkIfUserHasNFT();
      const characterNFT = characters[characterIndex.toNumber()];
      console.log("CharacterNFT: ", characterNFT);
      // setCharacterNFT(transformCharacterData(characterNFT));
      setCharacterNFT(characterNFT);
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContractInst = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setGameContract(gameContractInst);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    if (gameContract) {
      getCharacters();
      /*
       * Setup NFT Minted Listener
       */
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }
    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract]);

  const mintCharacterNFTAction = (characterId: number) => async () => {
    try {
      if (gameContract) {
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
      }
    } catch (error) {
      console.warn("MintCharacterAction Error:", error);
    }
  };

  const renderCharacters = () =>
    characters.map((character: CharacterData, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  );
};

export default SelectCharacter;
