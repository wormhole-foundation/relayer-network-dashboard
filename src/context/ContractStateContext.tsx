import { ChainId } from "@certusone/wormhole-sdk";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLogger } from "./LoggerContext";
import { get } from "http";
import { BigNumber } from "ethers";
import {
  ChainInfo,
  getChainInfo,
  getEnvironment,
  getEthersProvider,
} from "../utils/environment";
import { ethers } from "ethers";
import {
  DeliveryProvider,
  DeliveryProvider__factory,
  WormholeRelayer,
  WormholeRelayer__factory,
} from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";

export type WormholeRelayerContractState = {
  chainId: number;
  contractAddress: string;
  defaultProvider: string;
  registeredContracts: { chainId: number; contract: string }[];
};

export type DeliveryProviderContractState = {
  chainId: number;
  contractAddress: string;
  rewardAddress: string;
  owner: string;
  pendingOwner: string;
  pricingWallet: string;
  deliveryOverheads: { chainId: number; deliveryOverhead: BigNumber }[];
  supportedChains: { chainId: number; isSupported: boolean }[];
  targetChainAddresses: { chainId: number; whAddress: string }[];
  gasPrices: { chainId: number; gasPrice: BigNumber }[];
  weiPrices: { chainId: number; weiPrice: BigNumber }[];
  maximumBudgets: { chainId: number; maximumBudget: BigNumber }[];
  assetConversionBuffers: {
    chainId: number;
    assetConversionBuffer: { numerator: number; denominator: number };
  }[];
};

interface ContractStateContext {
  getRelayerContract(
    ChainId: ChainId,
    forceRefresh?: boolean
  ): Promise<WormholeRelayerContractState>;
  getDeliveryProviderContractState(
    ChainId: ChainId,
    forceRefresh?: boolean
  ): Promise<DeliveryProviderContractState>;
}

const ContractStateContext = React.createContext<ContractStateContext>({
  getRelayerContract: async (ChainId: ChainId, forceRefresh?: boolean) => {
    return null as any;
  },
  getDeliveryProviderContractState: async (
    ChainId: ChainId,
    forceRefresh?: boolean
  ) => {
    return null as any;
  },
});

export const ContractStateProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  //must be nested below the logger context
  const { log, clear, logs } = useLogger();
  const [relayerContractStates, setRelayerContractStates] = useState<
    WormholeRelayerContractState[]
  >([]);
  const [deliveryProviderContractStates, setDeliveryProviderContractStates] =
    useState<DeliveryProviderContractState[]>([]);

  const getRelayerContract = useCallback(
    async (chainId: ChainId, forceRefresh?: boolean) => {
      log("Calling getRelayerContract with chainId: " + chainId);

      const cached = relayerContractStates.find(
        (state) => state.chainId === chainId
      );

      if (cached && !forceRefresh) {
        return cached;
      } else {
        const state: WormholeRelayerContractState = await fetchRelayerContract(
          getChainInfo(chainId),
          log
        );
        setRelayerContractStates((old) => [...old, state]);
        return state;
      }
    },
    [log]
  );

  const getDeliveryProviderContractState = useCallback(
    async (chainId: ChainId, forceRefresh?: boolean) => {
      log("Calling getDeliveryProviderContractState with chainId: " + chainId);

      const cached = deliveryProviderContractStates.find(
        (state) => state.chainId === chainId
      );

      if (cached && !forceRefresh) {
        return cached;
      } else {
        const state: DeliveryProviderContractState =
          await fetchDeliveryProviderContractState(getChainInfo(chainId), log);
        setDeliveryProviderContractStates((old) => [...old, state]);
        return state;
      }
    },
    [log]
  );

  const contextValue = useMemo(
    () => ({
      getRelayerContract,
      getDeliveryProviderContractState,
    }),
    [logs, clear, log]
  );

  return (
    <ContractStateContext.Provider value={contextValue}>
      {children}
    </ContractStateContext.Provider>
  );
};

export const useContractState = () => {
  return useContext(ContractStateContext);
};

//This code is adapted from the ethereum/ts-scripts folder in the wormhole monorepo
async function fetchRelayerContract(
  chainInfo: ChainInfo,
  log?: (value: string, type?: "error" | "info" | "success" | undefined) => void
): Promise<WormholeRelayerContractState> {
  try {
    const env = getEnvironment();
    const contractAddress = chainInfo.relayerContractAddress;
    log && log("Querying " + contractAddress);

    const provider = getEthersProvider(chainInfo);

    const coreRelayer = await getWormholeRelayer(chainInfo, provider);

    // This is excessive to always do, but can be uncommented if needed.
    // console.log("Querying default provider for code");
    // const codeReceipt = await provider.getCode(contractAddress);
    // console.log("Code: " + codeReceipt);

    const registeredContracts: { chainId: number; contract: string }[] = [];

    for (const chainInfo of env.chainInfos) {
      registeredContracts.push({
        chainId: chainInfo.chainId,
        contract: (
          await coreRelayer.getRegisteredWormholeRelayerContract(
            chainInfo.chainId
          )
        ).toString(),
      });
    }

    const defaultProvider = await coreRelayer.getDefaultDeliveryProvider();
    return {
      chainId: chainInfo.chainId,
      contractAddress,
      defaultProvider,
      registeredContracts,
    };
  } catch (e: any) {
    log &&
      log("Failed to gather status for chain " + chainInfo.chainId, "error");
    log && log(e.toString(), "error");
  }

  return Promise.reject();
}

export async function getWormholeRelayer(
  chain: ChainInfo,
  provider: ethers.providers.StaticJsonRpcProvider
): Promise<WormholeRelayer> {
  const thisChainsRelayer = chain.relayerContractAddress;
  return WormholeRelayer__factory.connect(thisChainsRelayer, provider);
}

//this code is adapted from the ethereum/ts-scripts folder in the wormhole monorepo
async function fetchDeliveryProviderContractState(
  chainInfo: ChainInfo,
  log?: (value: string, type?: "error" | "info" | "success" | undefined) => void
): Promise<DeliveryProviderContractState> {
  console.log(
    "Gathering relay provider contract status for chain " + chainInfo.chainId
  );

  try {
    const env = getEnvironment();
    const provider = getEthersProvider(chainInfo);
    const deliveryProvider = await getDeliveryProviderContract(
      chainInfo,
      provider
    );
    const contractAddress = chainInfo.defaultDeliveryProviderContractAddress;

    // This is excessive to always do, but can be uncommented if needed.
    // console.log("Querying Relay Provider for code");
    // const codeReceipt = await provider.getCode(contractAddress);
    //console.log("Code: " + codeReceipt);

    const rewardAddress = await deliveryProvider.getRewardAddress();
    const supportedChains: {
      chainId: number;
      isSupported: boolean;
    }[] = [];
    const targetChainAddresses: {
      chainId: number;
      whAddress: string;
    }[] = [];
    const deliveryOverheads: {
      chainId: number;
      deliveryOverhead: BigNumber;
    }[] = [];
    const gasPrices: { chainId: number; gasPrice: BigNumber }[] = [];
    const weiPrices: { chainId: number; weiPrice: BigNumber }[] = [];
    const maximumBudgets: { chainId: number; maximumBudget: BigNumber }[] = [];
    const assetConversionBuffers: {
      chainId: number;
      assetConversionBuffer: { numerator: number; denominator: number };
    }[] = [];

    const owner: string = await deliveryProvider.owner();
    const pendingOwner: string = await deliveryProvider.pendingOwner();
    const pricingWallet: string = await deliveryProvider.pricingWallet();

    for (const chainInfo of env.chainInfos) {
      supportedChains.push({
        chainId: chainInfo.chainId,
        isSupported: await deliveryProvider.isChainSupported(chainInfo.chainId),
      });

      targetChainAddresses.push({
        chainId: chainInfo.chainId,
        whAddress: await deliveryProvider.getTargetChainAddress(
          chainInfo.chainId
        ),
      });

      deliveryOverheads.push({
        chainId: chainInfo.chainId,
        deliveryOverhead: await deliveryProvider.quoteDeliveryOverhead(
          chainInfo.chainId
        ),
      });
      gasPrices.push({
        chainId: chainInfo.chainId,
        gasPrice: await deliveryProvider.quoteGasPrice(chainInfo.chainId),
      });
      weiPrices.push({
        chainId: chainInfo.chainId,
        weiPrice: await deliveryProvider.quoteAssetConversion(
          chainInfo.chainId,
          ethers.utils.parseEther("1")
        ),
      });
      maximumBudgets.push({
        chainId: chainInfo.chainId,
        maximumBudget: await deliveryProvider.maximumBudget(chainInfo.chainId),
      });
      const assetConversionBuffer =
        await deliveryProvider.assetConversionBuffer(chainInfo.chainId);
      assetConversionBuffers.push({
        chainId: chainInfo.chainId,
        assetConversionBuffer: {
          numerator: assetConversionBuffer[0],
          denominator: assetConversionBuffer[1],
        },
      });
    }

    return {
      chainId: chainInfo.chainId,
      contractAddress,
      rewardAddress,
      deliveryOverheads,
      supportedChains,
      targetChainAddresses,
      gasPrices,
      weiPrices,
      owner,
      pendingOwner,
      pricingWallet,
      maximumBudgets,
      assetConversionBuffers,
    };
  } catch (e: any) {
    log &&
      log(
        "Failed to gather delivery provider contract status for chain " +
          chainInfo.chainId,
        "error"
      );
    log && log(e.toString(), "error");
  }

  return Promise.reject();
}

export async function getDeliveryProviderContract(
  chain: ChainInfo,
  provider: ethers.providers.StaticJsonRpcProvider
): Promise<DeliveryProvider> {
  const thisChainsRelayer = chain.relayerContractAddress;
  return DeliveryProvider__factory.connect(thisChainsRelayer, provider);
}
