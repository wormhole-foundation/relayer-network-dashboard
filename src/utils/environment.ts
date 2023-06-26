import { ChainId } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";

let env: Environment | null = null;

export type Environment = {
  chainInfos: ChainInfo[];
  guardianRpcs: string[];
};

export type ChainInfo = {
  chainId: ChainId;
  chainName: string;
  nativeCurrencyName: string;
  nativeCurrencyDecimals: number;
  nativeCurrencyUsdPrice: number;
  relayerContractAddress: string;
  defaultDeliveryProviderContractAddress: string;
  mockIntegrationAddress: string;
  rpcUrl: string;
};

const tiltEnv: Environment = {
  chainInfos: [
    {
      chainId: 2 as ChainId,
      chainName: "Eth-Tilt",
      nativeCurrencyName: "ETH",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 1700,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress:
        "0x1ef9e15c3bbf0555860b5009B51722027134d53a",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: "http://localhost:8545",
    },
    {
      chainId: 4 as ChainId,
      chainName: "BSC-Tilt",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 300,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress:
        "0x1ef9e15c3bbf0555860b5009B51722027134d53a",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: "http://localhost:8546",
    },
  ],
  guardianRpcs: ["http://localhost:7070"],
};

const testnetEnv: Environment = {
  chainInfos: [],
  guardianRpcs: [],
};

const mainnetEnv: Environment = {
  chainInfos: [],
  guardianRpcs: [],
};

export function getEnvironment(): Environment {
  if (env === null) {
    const envString = process.env.REACT_APP_TARGET_ENVIRONMENT;
    if (envString === undefined) {
      throw new Error("Environment variable TARGET_ENVIRONMENT not set");
    }
    if (
      envString.toLowerCase() === "devnet" ||
      envString.toLowerCase() === "tilt"
    ) {
      env = tiltEnv;
    } else if (envString.toLowerCase() === "testnet") {
      env = testnetEnv;
    } else if (envString.toLowerCase() === "mainnet") {
      env = mainnetEnv;
    } else {
      throw new Error(`Unknown environment ${envString}`);
    }
  }

  return env;
}

export function getEthersProvider(chainInfo: ChainInfo) {
  return new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
}

export function getChainInfo(chainId: ChainId): ChainInfo {
  const output = getEnvironment().chainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  );

  if (output === undefined) {
    throw new Error(`Unknown chainId ${chainId}`);
  }

  return output;
}
