import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getChainInfo, getEnvironment } from "../utils/environment";
import {
  DeliveryProviderContractState,
  WormholeRelayerContractState,
  useContractState,
} from "../context/ContractStateContext";
import { useCallback, useEffect, useState } from "react";
import { get } from "http";
import { ChainId } from "@certusone/wormhole-sdk";

export default function ContractStates() {
  const environment = getEnvironment();

  const allChains = environment.chainInfos.map((chainInfo) => {
    return <SingleChainViewer chainId={chainInfo.chainId} />;
  });

  return (
    <Paper>
      <Typography variant="h5">Contract States</Typography>
      {allChains}
    </Paper>
  );
}

function SingleChainViewer(props: { chainId: number }) {
  const [error, setError] = useState("");
  const [relayerLoading, setRelayerLoading] = useState(false);
  const [deliveryProviderLoading, setDeliveryProviderLoading] = useState(false);
  const [relayer, setRelayer] = useState<WormholeRelayerContractState>();
  const [deliveryProvider, setDeliveryProvider] =
    useState<DeliveryProviderContractState>();

  const { getRelayerContract, getDeliveryProviderContractState } =
    useContractState();

  const chainInfo = getChainInfo(props.chainId as ChainId);

  const onExpand = useCallback(
    (event: any, expanded: boolean) => {
      console.log("expanded", expanded);
      if (expanded) {
        setRelayerLoading(true);
        setDeliveryProviderLoading(true);
        setError("");
        getRelayerContract(props.chainId as ChainId)
          .then((result) => {
            console.log("got relayer");
            setRelayerLoading(false);
            setRelayer(result);
          })
          .catch((e) => {
            setError(
              e && e.message
                ? e.message
                : "An error occurred while fetching the relayer contract state. Try again."
            );
            setRelayerLoading(false);
          });
        getDeliveryProviderContractState(props.chainId as ChainId)
          .then((result) => {
            console.log("got delivery provider");
            setDeliveryProviderLoading(false);
            setDeliveryProvider(result);
          })
          .catch((e) => {
            setError(
              e && e.message
                ? e.message
                : "An error occurred while fetching the delivery provider contract state. Try again."
            );
            setDeliveryProviderLoading(false);
          });
      }
    },
    [props.chainId, getRelayerContract, getDeliveryProviderContractState]
  );

  let displayedContent: any = "No Content";

  console.log("relayer", relayer);
  console.log("deliveryProvider", deliveryProvider);

  if (error) {
    displayedContent = <Typography>{"Error: " + error}</Typography>;
  } else if (relayerLoading) {
    displayedContent = <Typography>Loading relayer...</Typography>;
  } else if (deliveryProviderLoading) {
    displayedContent = <Typography>Loading delivery provider...</Typography>;
  } else if (relayer && deliveryProvider) {
    displayedContent = (
      <DisplayContracts relayer={relayer} deliveryProvider={deliveryProvider} />
    );
  } else {
    displayedContent = <Typography>Unexpected Error Occurred</Typography>;
  }

  return (
    <Accordion onChange={onExpand}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{chainInfo.chainId + " " + chainInfo.chainName}</Typography>
      </AccordionSummary>
      <AccordionDetails>{displayedContent}</AccordionDetails>
    </Accordion>
  );
}

function DisplayContracts(props: {
  relayer: WormholeRelayerContractState;
  deliveryProvider: DeliveryProviderContractState;
}) {
  return (
    <div style={{ display: "flex" }}>
      <div>
        <Typography>Relayer</Typography>
        <Typography>Chain ID: {props.relayer.chainId}</Typography>
        <Typography>
          Contract Address: {props.relayer.contractAddress}
        </Typography>
        <Typography>
          Default Provider: {props.relayer.defaultProvider}
        </Typography>
        <Typography>Registered Contracts:</Typography>
        {props.relayer.registeredContracts.map((contract) => {
          return (
            <Typography>
              {contract.chainId} {contract.contract}
            </Typography>
          );
        })}
      </div>
      <div>
        <Typography>Delivery Provider</Typography>
        <Typography>Chain ID: {props.deliveryProvider.chainId}</Typography>
        <Typography>
          Contract Address: {props.deliveryProvider.contractAddress}
        </Typography>
        <Typography>
          Reward Address: {props.deliveryProvider.rewardAddress}
        </Typography>
        <Typography>Owner Address: {props.deliveryProvider.owner}</Typography>
        <Typography>
          Pending Owner: {props.deliveryProvider.pendingOwner}
        </Typography>
        <Typography>
          Pricing Wallet: {props.deliveryProvider.pricingWallet}
        </Typography>
        <Typography>Delivery Overheads:</Typography>
        {props.deliveryProvider.deliveryOverheads.map((overhead) => {
          return (
            <Typography>
              {overhead.chainId + " : "} {overhead.deliveryOverhead.toString()}
            </Typography>
          );
        })}
        <Typography>Supported Chains :</Typography>
        {props.deliveryProvider.supportedChains.map((chain) => {
          return (
            <Typography>
              {chain.chainId + " : "} {chain.isSupported.toString()}
            </Typography>
          );
        })}
        <Typography>Target Chain Addresses</Typography>
        {props.deliveryProvider.targetChainAddresses.map((address) => {
          return (
            <Typography>
              {address.chainId + " : "} {address.whAddress}
            </Typography>
          );
        })}
        <Typography>Gas Prices</Typography>
        {props.deliveryProvider.gasPrices.map((gasPrice) => {
          return (
            <Typography>
              {gasPrice.chainId + " : "} {gasPrice.gasPrice.toString()}
            </Typography>
          );
        })}
        <Typography>Native Prices</Typography>
        {props.deliveryProvider.weiPrices.map((nativePrice) => {
          return (
            <Typography>
              {nativePrice.chainId + " : "} {nativePrice.weiPrice.toString()}
            </Typography>
          );
        })}
        <Typography>Maximum Budgets</Typography>
        {props.deliveryProvider.maximumBudgets.map((budget) => {
          return (
            <Typography>
              {budget.chainId + " : "} {budget.maximumBudget.toString()}
            </Typography>
          );
        })}
        <Typography>Asset Conversion Buffers</Typography>
        {props.deliveryProvider.assetConversionBuffers.map((buffer) => {
          return (
            <Typography>
              {buffer.chainId + " : "} {buffer.assetConversionBuffer.toString()}
            </Typography>
          );
        })}
      </div>
    </div>
  );
}
