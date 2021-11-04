import { BigNumber } from "@ethersproject/bignumber";

const CONTRACT_ADDRESS = "0x9bC20fA0c1038d857F1FC9a3bF3A8CACD7F26207";

// TS Interfaces to work with on the app
export interface CharacterData {
  name: string;
  imageURI: string;
  hp: number;
  maxHp: number;
  attackDamage: number;
}

export interface PlayableCharacterData extends CharacterData {
  defense: number;
  criticalHitAt: number;
  criticalHitCounter: number;
}

// TS Sol interfaces to help transporm data
export interface CharacterContractData {
  name: string;
  imageURI: string;
  hp: BigNumber;
  maxHp: BigNumber;
  attackDamage: BigNumber;
  defense?: BigNumber;
  criticalHitAt?: number;
  criticalHitCounter?: number;
}

const transformCharacterData = (
  characterData: CharacterContractData
): CharacterData | PlayableCharacterData => {
  if ("defense" in characterData) {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      defense: characterData?.defense?.toNumber(),
      criticalHitAt: characterData?.criticalHitAt,
      criticalHitCounter: characterData?.criticalHitCounter,
      attackDamage: characterData.attackDamage.toNumber(),
    };
  } else {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
    };
  }
};

export { CONTRACT_ADDRESS, transformCharacterData };
