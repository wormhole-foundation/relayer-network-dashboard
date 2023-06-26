import { useLogger } from "../context/LoggerContext";
import LogViewer from "../components/logViewer";
import { getEnvironment } from "../utils/environment";
import ContractStates from "../components/contractStatusViewer";

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
    <div>
      <button onClick={pushLog}>Push Log</button>
      <button onClick={clear}>Clear Logs</button>
      <ContractStates />
      <LogViewer />
    </div>
  );
}
