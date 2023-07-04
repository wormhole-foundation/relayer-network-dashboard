import { useLogger } from "../context/LoggerContext";
import LogViewer from "../components/logViewer";
import { getEnvironment } from "../utils/environment";
import ContractStates from "../components/contractStatusViewer";
import DeliveryStatus from "../components/DeliveryStatus";
import EthereumSignerKey from "../components/EthereumSignerKey";

export default function ContractStateView() {
  const env = getEnvironment();
  const { log, clear, logs } = useLogger();
  const pushLog = () => {
    log("PUSHED");
  };

  //TODO chain selector

  //TODO load button

  //TODO call contract state loader on button press

  //TODO display contract state

  //TODO dump contract state into persisted logger object

  return (
    <div style={{ padding: "10px", margin: "10px" }}>
      <EthereumSignerKey />
      <div style={{ height: "10px" }} />
      <DeliveryStatus />
      <div style={{ height: "10px" }} />
      <ContractStates />
      <div style={{ height: "10px" }} />
      <LogViewer />
    </div>
  );
}
