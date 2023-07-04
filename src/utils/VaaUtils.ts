import {
  CHAIN_ID_TO_NAME,
  ChainId,
  ChainName,
  ParsedVaa,
  getSignedVAAWithRetry,
  parseVaa,
  relayer,
  tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import { ChainInfo, Environment, getEthersProvider } from "./environment";
import {
  DeliveryInfo,
  DeliveryInstruction,
  RedeliveryInstruction,
  RelayerPayloadId,
  getWormholeRelayerInfoBySourceSequence,
  parseWormholeRelayerPayloadType,
  parseWormholeRelayerResend,
  parseWormholeRelayerSend,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { Implementation__factory } from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { ethers } from "ethers";
export type WormholeTransaction = {
  chainId: ChainId;
  txHash: string;
};

export async function getGenericRelayerVaasFromTransaction(
  environment: Environment,
  chainInfo: ChainInfo,
  txHash: string
): Promise<ParsedVaa[]> {
  const vaas = await getAllVaasFromTransaction(environment, txHash, chainInfo);

  const parsedVaas = vaas.map((vaa) => {
    return parseVaa(vaa);
  });

  const filtered = parsedVaas.filter((vaa) => {
    return (
      vaa.emitterAddress.toString("hex") ===
      tryNativeToHexString(chainInfo.relayerContractAddress, "ethereum")
    );
  });

  return filtered;
}

export async function getVaa(
  environment: Environment,
  chainInfo: ChainInfo,
  emitterAddress: string,
  sequence: string
): Promise<ParsedVaa | null> {
  const vaa = await getSignedVAAWithRetry(
    environment.guardianRpcs,
    chainInfo.chainId,
    emitterAddress,
    sequence,
    {},
    1000,
    5
  );
  if (!vaa) {
    return null;
  } else {
    return parseVaa(vaa.vaaBytes);
  }
}

export function parseGenericRelayerVaas(
  vaas: ParsedVaa[]
): (DeliveryInstruction | RedeliveryInstruction)[] {
  const output = vaas.map((vaa) => {
    return parseGenericRelayerPayloads([vaa.payload])[0];
  });

  return output;
}

export function parseGenericRelayerPayloads(
  payloads: Buffer[]
): (DeliveryInstruction | RedeliveryInstruction)[] {
  const output = payloads.map((payload) => {
    const payloadId = parseWormholeRelayerPayloadType(payload);
    return payloadId == RelayerPayloadId.Delivery
      ? parseWormholeRelayerSend(payload)
      : parseWormholeRelayerResend(payload);
  });

  return output;
}

export function parseGenericRelayerVaa(
  vaa: ParsedVaa
): DeliveryInstruction | RedeliveryInstruction | null {
  try {
    return parseGenericRelayerPayloads([vaa.payload])[0];
  } catch (e) {
    return null;
  }
}

export async function getAllVaasFromTransaction(
  environment: Environment,
  txHash: string,
  chainInfo: ChainInfo
): Promise<Uint8Array[]> {
  //Connect to the source chain
  const provider = getEthersProvider(chainInfo);

  //Get the transaction receipt
  const receipt = await provider.getTransactionReceipt(txHash);

  //pull all the logs from the bridge transaction
  const bridgeLogs = receipt.logs.filter((l) => {
    return l.address === chainInfo.coreBridgeAddress;
  });

  const keys = bridgeLogs.map((bridgeLog) => {
    const {
      args: { sequence, sender },
    } = Implementation__factory.createInterface().parseLog(bridgeLog);
    return { sequence, sender };
  });

  let vaas: Uint8Array[] = [];

  for (const key of keys) {
    console.log("about to fetch vaas found during transaction");
    console.log(key.sender, key.sequence);
    const vaa = await getSignedVAAWithRetry(
      environment.guardianRpcs,
      CHAIN_ID_TO_NAME[chainInfo.chainId],
      tryNativeToHexString(key.sender, "ethereum"),
      key.sequence.toString(),
      {},
      1000,
      5
    );

    vaas.push(vaa.vaaBytes);
  }

  return vaas;
}

export async function getDeliveryStatus(
  env: Environment,
  chainInfo: ChainInfo,
  txHash: string,
  instruction: DeliveryInstruction,
  txIndexPosition: number
): Promise<DeliveryInfo> {
  const targetChainInfo = env.chainInfos.find(
    (c) => c.chainId === instruction.targetChainId
  );
  if (!targetChainInfo) throw new Error("No chainInfo found for target chain");

  return (await relayer.getWormholeRelayerInfo(
    CHAIN_ID_TO_NAME[chainInfo.chainId],
    txHash,
    {
      sourceChainProvider: getEthersProvider(chainInfo),
      environment: env.network,
      targetChainProviders: getTargetChainProviders(env),
      wormholeRelayerWhMessageIndex: txIndexPosition,
    }
  )) as relayer.DeliveryInfo;
}

export async function getDeliveryStatusByVaa(
  env: Environment,
  vaa: ParsedVaa
): Promise<relayer.DeliveryTargetInfo[]> {
  const instruction = parseGenericRelayerVaa(vaa);
  const deliveryInstruction = instruction as DeliveryInstruction;

  if (!instruction) {
    throw new Error("Invalid VAA");
  }
  if (isRedelivery(instruction)) {
    throw new Error("Redelivery instruction not supported");
  }
  const targetChainProvider = getTargetChainProviders(env).get(
    CHAIN_ID_TO_NAME[deliveryInstruction.targetChainId as ChainId]
  );
  if (!targetChainProvider) {
    throw new Error("No target chain provider found");
  }
  const blockNumbers = [-2040, "latest"];
  const targetWormholeRelayerContractAddress = env.chainInfos.find(
    (c) => c.chainId === deliveryInstruction.targetChainId
  )?.relayerContractAddress;
  if (!targetWormholeRelayerContractAddress) {
    throw new Error("No target wormhole relayer contract address found");
  }

  const infos = await getWormholeRelayerInfoBySourceSequence(
    env.network,
    CHAIN_ID_TO_NAME[deliveryInstruction.targetChainId as ChainId],
    targetChainProvider,
    CHAIN_ID_TO_NAME[vaa.emitterChain as ChainId],
    ethers.BigNumber.from(vaa.sequence),
    blockNumbers[0],
    blockNumbers[1],
    targetWormholeRelayerContractAddress
  );

  return infos.events;
}

export function getTargetChainProviders(
  environment: Environment
): Map<ChainName, ethers.providers.JsonRpcProvider> {
  const output = new Map<ChainName, ethers.providers.JsonRpcProvider>();

  for (const chainInfo of environment.chainInfos) {
    output.set(
      CHAIN_ID_TO_NAME[chainInfo.chainId],
      getEthersProvider(chainInfo)
    );
  }

  return output;
}

export function isRedelivery(
  instruction: DeliveryInstruction | RedeliveryInstruction
): boolean {
  return instruction.hasOwnProperty("newSenderAddress");
}
