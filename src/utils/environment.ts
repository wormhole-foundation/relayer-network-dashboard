import { ChainId } from "@certusone/wormhole-sdk";

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
  relayerContractAddress: string;
  defaultRelayProviderContractAddress: string;
  rpcUrl: string;
};

const tiltEnv: Environment = {
  chainInfos: [],
  guardianRpcs: [],
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
    const envString = process.env.TARGET_ENVIRONMENT;
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
