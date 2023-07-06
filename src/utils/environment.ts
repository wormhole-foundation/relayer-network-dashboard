import { ChainId, Network } from "@certusone/wormhole-sdk";
import { NetworkCell } from "@mui/icons-material";
import { ethers } from "ethers";

let env: Environment | null = null;

export type Environment = {
  chainInfos: ChainInfo[];
  guardianRpcs: string[];
  network: Network;
};

export type ChainInfo = {
  chainId: ChainId;
  evmNetworkId: number;
  chainName: string;
  nativeCurrencyName: string;
  nativeCurrencyDecimals: number;
  nativeCurrencyUsdPrice: number;
  relayerContractAddress: string;
  defaultDeliveryProviderContractAddress: string;
  coreBridgeAddress: string;
  mockIntegrationAddress: string;
  rpcUrl: string;
};

export const tiltEnv: Environment = {
  network: "DEVNET",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      evmNetworkId: 1337,
      chainName: "Eth-Tilt",
      nativeCurrencyName: "ETH",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 1700,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress:
        "0x1ef9e15c3bbf0555860b5009B51722027134d53a",
      coreBridgeAddress: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: "http://localhost:8545",
    },
    {
      chainId: 4 as ChainId,
      evmNetworkId: 1397,
      chainName: "BSC-Tilt",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 300,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress:
        "0x1ef9e15c3bbf0555860b5009B51722027134d53a",
      coreBridgeAddress: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: "http://localhost:8546",
    },
  ],
  guardianRpcs: ["http://localhost:7071"],
};

export const testnetEnv: Environment = {
  network: "TESTNET",
  chainInfos: [
    {
      chainId: 4 as ChainId,
      evmNetworkId: 97,
      chainName: "BSC - Testnet",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 300,
      relayerContractAddress: "0x80aC94316391752A193C1c47E27D382b507c93F3",
      defaultDeliveryProviderContractAddress:
        "0x60a86b97a7596eBFd25fb769053894ed0D9A8366",
      coreBridgeAddress: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
      mockIntegrationAddress: "0xb6A04D6672F005787147472Be20d39741929Aa03",
      rpcUrl: "https://data-seed-prebsc-2-s3.binance.org:8545",
    },
    {
      chainId: 5 as ChainId,
      evmNetworkId: 80001,
      chainName: "Mumbai",
      nativeCurrencyName: "MATIC",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.66,
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      defaultDeliveryProviderContractAddress:
        "0x60a86b97a7596eBFd25fb769053894ed0D9A8366",
      coreBridgeAddress: "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
      mockIntegrationAddress: "0x3bF0c43d88541BBCF92bE508ec41e540FbF28C56",
      rpcUrl: "https://matic-mumbai.chainstacklabs.com",
    },
    {
      chainId: 6 as ChainId,
      evmNetworkId: 43113,
      chainName: "Fuji",
      nativeCurrencyName: "AVAX",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 12,
      relayerContractAddress: "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
      defaultDeliveryProviderContractAddress:
        "0x60a86b97a7596eBFd25fb769053894ed0D9A8366",
      coreBridgeAddress: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
      mockIntegrationAddress: "0x5E52f3eB0774E5e5f37760BD3Fca64951D8F74Ae",
      rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    },
    {
      chainId: 14 as ChainId,
      evmNetworkId: 44787,
      chainName: "Celo - Alfajores",
      nativeCurrencyName: "Celo",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.51,
      relayerContractAddress: "0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84",
      defaultDeliveryProviderContractAddress:
        "0x60a86b97a7596eBFd25fb769053894ed0D9A8366",
      coreBridgeAddress: "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56",
      mockIntegrationAddress: "0x7f1d8E809aBB3F6Dc9B90F0131C3E8308046E190",
      rpcUrl: "https://alfajores-forno.celo-testnet.org",
    },
    {
      chainId: 16 as ChainId,
      evmNetworkId: 1287,
      chainName: "Moonbase Alpha",
      nativeCurrencyName: "GLMR",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.26,
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      defaultDeliveryProviderContractAddress:
        "0x60a86b97a7596eBFd25fb769053894ed0D9A8366",
      coreBridgeAddress: "0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901",
      mockIntegrationAddress: "0x3bF0c43d88541BBCF92bE508ec41e540FbF28C56",
      rpcUrl: "https://rpc.api.moonbase.moonbeam.network",
    },
  ],
  guardianRpcs: ["https://wormhole-v2-testnet-api.certus.one"],
};

export const mainnetEnv: Environment = {
  network: "MAINNET",
  chainInfos: [],
  guardianRpcs: [],
};

// Use environment context instead
// export function getEnvironment(): Environment {
//   if (env === null) {
//     const envString = process.env.REACT_APP_TARGET_ENVIRONMENT;
//     if (envString === undefined) {
//       throw new Error("Environment variable TARGET_ENVIRONMENT not set");
//     }
//     if (
//       envString.toLowerCase() === "devnet" ||
//       envString.toLowerCase() === "tilt"
//     ) {
//       env = tiltEnv;
//     } else if (envString.toLowerCase() === "testnet") {
//       env = testnetEnv;
//     } else if (envString.toLowerCase() === "mainnet") {
//       env = mainnetEnv;
//     } else {
//       throw new Error(`Unknown environment ${envString}`);
//     }
//   }

//   return env;
// }

export function getEthersProvider(chainInfo: ChainInfo) {
  return new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
}

export function getChainInfo(env: Environment, chainId: ChainId): ChainInfo {
  const output = env.chainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  );

  if (output === undefined) {
    throw new Error(`Unknown chainId ${chainId}`);
  }

  return output;
}
