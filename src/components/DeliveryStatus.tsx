import {
  ChainId,
  ParsedVaa,
  parseVaa,
  relayer,
  tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import { getChainInfo, getEnvironment } from "../utils/environment";
import ChainSelector from "./chainSelector";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Divider,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  DeliveryInfo,
  DeliveryInstruction,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import {
  getGenericRelayerVaasFromTransaction,
  getVaa,
  isRedelivery,
  parseGenericRelayerVaa,
} from "../utils/VaaUtils";
import { env } from "process";
import { useLogger } from "../context/LoggerContext";

//test tx hash 0xcf66519f71be66c7ab5582e864a37d686c6164a32b3df22c89b32119ecfcfc5e
//test sequence 1
//test VAA 010000000001005867d34b56b4433ad913e6ce2573e09d24c9f1db4317a37cdd55efe7540e1bd461641020a9d916f0eaab764fac84d4a2cb678d34f5704661ed94554e9a7e403e00000002f300000000000600000000000000000000000053855d4b64e9a3cf59a84bc768ada716b5536bc50000000000000001c80100040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00000011000000000849443a2035363537000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000004285e6049200040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00

export default function DeliveryStatus() {
  const environment = getEnvironment();
  const { log, clear, logs } = useLogger();
  const [chain, setChain] = useState<ChainId>(
    environment.chainInfos[0].chainId
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [sequence, setSequence] = useState("");
  const [queryType, setQueryType] = useState("txHash");
  const [vaaRaw, setVaaRaw] = useState("");

  const targetContract = environment.chainInfos.find(
    (c) => c.chainId == chain
  )?.relayerContractAddress;
  const emitter = targetContract
    ? tryNativeToHexString(targetContract, "ethereum")
    : "Error, unconfigured";

  const [vaaResults, setVaaResults] = useState<ParsedVaa[]>([]);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newItem: string
  ) => {
    setQueryType(newItem);
  };

  const toggler = (
    <ToggleButtonGroup
      color="primary"
      value={queryType}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      style={{ margin: "10px", maxHeight: "55px" }}
    >
      <ToggleButton value="txHash">TxHash</ToggleButton>
      <ToggleButton value="EmitterSeq">EmitterSeq</ToggleButton>
      <ToggleButton value="VAA">VAA</ToggleButton>
    </ToggleButtonGroup>
  );

  useEffect(() => {
    if (queryType === "txHash" && txHash) {
      setVaaResults([]);
      log &&
        log("Fetching VAA for txHash: " + txHash, "DeliveryStatus", "info");
      setError("");
      setLoading(true);
      getGenericRelayerVaasFromTransaction(
        environment,
        getChainInfo(chain as ChainId),
        txHash
      )
        .then((vaas) => {
          log &&
            log("Got VAA for txHash: " + txHash, "DeliveryStatus", "success");
          if (vaas) {
            setVaaResults(vaas);
          }
          setLoading(false);
        })
        .catch((e) => {
          log &&
            log(
              "Error getting VAA for txHash: " + txHash,
              "DeliveryStatus",
              "error"
            );
          log && log(e.message, "DeliveryStatus", "error");
          setError(e.message);
          setLoading(false);
        });
    } else if (queryType === "EmitterSeq") {
      if (sequence) {
        setVaaResults([]);
        log &&
          log(
            "Fetching VAA for EmitterSeq: " + sequence,
            "DeliveryStatus",
            "info"
          );
        setError("");
        setLoading(true);
        getVaa(environment, getChainInfo(chain as ChainId), emitter, sequence)
          .then((vaa) => {
            log &&
              log(
                "Got VAA for EmitterSeq: " + sequence,
                "DeliveryStatus",
                "success"
              );
            if (vaa) {
              setVaaResults([vaa]);
            }
            setLoading(false);
          })
          .catch((e) => {
            log &&
              log(
                "Error getting VAA for EmitterSeq: " + sequence,
                "DeliveryStatus",
                "error"
              );
            setError(e.message);
            setLoading(false);
          });
      }
    } else if (queryType === "VAA") {
      if (vaaRaw) {
        try {
          setVaaResults([]);
          setError("");
          let cloned;
          //detect if the string is base64 encoded
          const isBase64 = vaaRaw.match(/^[a-zA-Z0-9+/]+={0,2}$/);
          const isHexEncoded =
            vaaRaw.match(/^0x[a-fA-F0-9]+$/) || vaaRaw.match(/^[a-fA-F0-9]+$/);
          //if it is, convert it to hex
          if (isHexEncoded) {
            log && log("VAA is hex encoded", "DeliveryStatus", "info");
            cloned = vaaRaw;
          } else if (isBase64) {
            log && log("VAA is base64 encoded", "DeliveryStatus", "info");
            cloned = Buffer.from(vaaRaw, "base64").toString("hex");
          } else {
            setError("Invalid VAA");
            return;
          }
          //remove all whitespace from the hex string, and also remove the 0x prefix if it exists,
          const trimmed = cloned.replace(/\s/g, "").replace(/^0x/, "") || "";

          //convert the trimmed hex string into a Uint8Array
          const vaaBytes = new Uint8Array(
            trimmed.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
          );

          //pipe it into the parseGenericRelayerVaa function
          const parsedVaa = parseVaa(vaaBytes);
          setVaaResults([parsedVaa]);
        } catch (e) {
          setError("Invalid VAA");
        }
      }
    } else {
      setError("Invalid query type");
    }
  }, [txHash, sequence, emitter, chain, vaaRaw]);

  const vaaReaders = vaaResults.length > 0 && (
    <div style={{ margin: "10px" }}>
      {vaaResults.map((vaa) => (
        <VaaReader vaa={vaa} />
      ))}
    </div>
  );

  return (
    <Paper style={{ padding: "10px" }}>
      <Typography variant="h5">Search for Delivery VAAs</Typography>
      <div style={{ display: "flex", margin: "10px" }}>
        {toggler}
        {(queryType == "txHash" || queryType == "EmitterSeq") && (
          <ChainSelector onChainSelected={setChain} />
        )}
        {queryType === "EmitterSeq" && (
          <>
            <TextField
              helperText="Sequence"
              value={sequence}
              onChange={(e: any) => setSequence(e.target.value)}
              variant="outlined"
              style={{ flexGrow: 1, margin: "10px" }}
            />
            <TextField
              helperText="Emitter (WH format)"
              value={emitter}
              variant="outlined"
              disabled
              style={{ flexGrow: 2, margin: "10px" }}
            />
          </>
        )}
        {queryType === "txHash" && (
          <TextField
            helperText="Transaction Hash"
            value={txHash}
            onChange={(e: any) => setTxHash(e.target.value)}
            variant="outlined"
            style={{ flexGrow: 1, margin: "10px" }}
          />
        )}
        {queryType === "VAA" && (
          <TextField
            helperText="Paste either a Hex or Base64 encoded VAA here"
            value={vaaRaw}
            onChange={(e: any) => setVaaRaw(e.target.value)}
            variant="outlined"
            style={{ flexGrow: 1, margin: "10px" }}
          />
        )}
      </div>
      {error && (
        <Alert severity="error" style={{ margin: "10px" }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Alert severity="info" style={{ margin: "10px" }}>
          Loading...
        </Alert>
      )}
      {vaaReaders && vaaReaders}
    </Paper>
  );
}

export function VaaReader({ vaa }: { vaa: ParsedVaa }) {
  const info: DeliveryInstruction | RedeliveryInstruction | null =
    parseGenericRelayerVaa(vaa);

  const [deliveryInfos, setDeliveryInfos] = useState<
    relayer.DeliveryTargetInfo[]
  >([]);
  const [deliveryInfoError, setDeliveryInfoError] = useState("");
  const [isLoadingDeliveryInfo, setIsLoadingDeliveryInfo] = useState(false);

  const [manualDeliverResult, setManualDeliverResult] = useState("");
  const [manualDeliverError, setManualDeliverError] = useState("");
  const [isLoadingManualDeliver, setIsLoadingManualDeliver] = useState(false);

  const onloadDeliveryInfo = useCallback(async () => {
    if (info) {
      setIsLoadingDeliveryInfo(true);
      setDeliveryInfoError("");
      try {
        //TODO: get delivery info
        const result = null;
        //setDeliveryInfos(result);
      } catch (e: any) {
        setDeliveryInfoError(e.message);
      } finally {
        setIsLoadingDeliveryInfo(false);
      }
    }
  }, [info]);

  const onManualDeliver = useCallback(async () => {
    if (info) {
      setIsLoadingManualDeliver(true);
      setManualDeliverError("");
      try {
        //TODO: manual deliver
        const result = null;
        //setManualDeliverResult(result);
      } catch (e: any) {
        setManualDeliverError(e.message);
      } finally {
        setIsLoadingManualDeliver(false);
      }
    }
  }, [info]);

  const vaaHeaderInfo = (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">VAA Info </Typography>
      <Divider />
      <Typography>Chain: {vaa.emitterChain}</Typography>
      <Typography>
        Emitter: {Buffer.from(vaa.emitterAddress).toString("hex")}
      </Typography>
      <Typography>Sequence: {vaa.sequence.toString()}</Typography>
      <Typography>Hash: {Buffer.from(vaa.hash).toString("hex")}</Typography>
      <Typography>Timestamp: {vaa.timestamp.toString()}</Typography>
    </div>
  );

  const vaaBodyInfo =
    info == null ? (
      <Typography>
        This VAA can't be parsed. It is likely not a Wormhole relayer VAA.
      </Typography>
    ) : isRedelivery(info) ? (
      <RedeliveryInstructionDisplay
        instruction={info as RedeliveryInstruction}
      />
    ) : (
      <DeliveryInstructionDisplay instruction={info as DeliveryInstruction} />
    );

  return (
    <div style={{ margin: "10px" }}>
      {vaaHeaderInfo}
      <div style={{ height: "10px" }} />
      {vaaBodyInfo}
    </div>
  );
}

export function RedeliveryInstructionDisplay({
  instruction,
}: {
  instruction: RedeliveryInstruction;
}) {
  return (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">Redelivery Instruction</Typography>
      <Typography>Original VAA Key Info</Typography>
      <Typography>{"Chain: " + instruction.deliveryVaaKey.chainId}</Typography>
      <Typography>
        {"Emitter" +
          Buffer.from(instruction.deliveryVaaKey.emitterAddress).toString(
            "hex"
          )}
      </Typography>
      <Typography>
        {"Sequence: " + instruction.deliveryVaaKey.sequence}
      </Typography>
      <div style={{ height: "10px" }} />
      <Typography>
        {"Encoded Execution Params: " +
          Buffer.from(instruction.newEncodedExecutionInfo.toString("hex"))}
      </Typography>
      <Typography>
        {"New Receiver Value: " + instruction.newRequestedReceiverValue}
      </Typography>
      <Typography>
        {"New Sender Address: " +
          Buffer.from(instruction.newSenderAddress).toString("hex")}
      </Typography>
      <Typography>
        {"New Delivery Provider: " +
          Buffer.from(instruction.newSourceDeliveryProvider).toString("hex")}
      </Typography>
      <Typography>{"Target Chain: " + instruction.targetChainId}</Typography>
    </div>
  );
}

export function DeliveryInstructionDisplay({
  instruction,
}: {
  instruction: DeliveryInstruction;
}) {
  const spacer = <div style={{ height: "10px" }} />;
  return (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">Delivery Instruction</Typography>
      <Divider />
      <Typography>{"Target Chain: " + instruction.targetChainId}</Typography>
      <Typography>
        {"Target Address: " +
          Buffer.from(instruction.targetAddress).toString("hex")}
      </Typography>
      <Typography>
        {"Extra Receiver Value: " + instruction.extraReceiverValue.toString()}
      </Typography>
      <Typography>
        {"Refund Address: " +
          Buffer.from(instruction.refundAddress).toString("hex")}
      </Typography>
      <Typography>{"Refund Chain: " + instruction.refundChainId}</Typography>
      <Typography>
        {"Refund Delivery Provider: " +
          Buffer.from(instruction.refundDeliveryProvider).toString("hex")}
      </Typography>
      <Typography>
        {"Receiver Value: " + instruction.requestedReceiverValue.toString()}
      </Typography>
      <Typography>
        {"Sender Address: " +
          Buffer.from(instruction.senderAddress).toString("hex")}
      </Typography>
      <Typography>
        {"Source Delivery Provider: " +
          Buffer.from(instruction.sourceDeliveryProvider).toString("hex")}
      </Typography>

      <Typography variant="subtitle1">Additional Vaa Keys:</Typography>
      {instruction.vaaKeys.map((vaaKey) => {
        return (
          <div>
            <Typography>{"Chain: " + vaaKey.chainId}</Typography>
            <Typography>
              {"Emitter" + Buffer.from(vaaKey.emitterAddress).toString("hex")}
            </Typography>
            <Typography>{"Sequence: " + vaaKey.sequence}</Typography>
          </div>
        );
      })}
      {spacer}
      <Typography>
        {"Encoded Execution Info: " +
          Buffer.from(instruction.encodedExecutionInfo).toString("hex")}
      </Typography>
      <Typography>
        {"Payload: " + Buffer.from(instruction.payload).toString("hex")}
      </Typography>
    </div>
  );
}
