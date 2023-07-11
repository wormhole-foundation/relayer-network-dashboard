import LogViewer from "../components/logViewer";
import ContractStates from "../components/contractStatusViewer";
import DeliveryStatus from "../components/DeliveryStatus";
import EthereumSignerKey from "../components/EthereumSignerKey";
import EnvironmentSelector from "../components/EnvironmentSelector";
import { Paper } from "@mui/material";

export default function ContractStateView() {
  //TODO chain selector

  //TODO load button

  //TODO call contract state loader on button press

  //TODO display contract state

  //TODO dump contract state into persisted logger object

  return (
    <div style={{ padding: "10px", margin: "10px" }}>
      <Paper>
        <div style={{ display: "flex", padding: "10px" }}>
          <EthereumSignerKey />
          <EnvironmentSelector />
        </div>
      </Paper>
      <div style={{ height: "10px" }} />
      <DeliveryStatus />
      <div style={{ height: "10px" }} />
      <ContractStates />
      <div style={{ height: "10px" }} />
      <LogViewer />
    </div>
  );
}
