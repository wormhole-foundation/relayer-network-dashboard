import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useEnvironment } from "../context/EnvironmentContext";

export default function EnvironmentSelector() {
  const { environment, setEnvironment } = useEnvironment();

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    setEnvironment(event.target.value as any);
  };

  return (
    <FormControl style={{ margin: "10px", minWidth: "150px" }}>
      <InputLabel>Current Environment</InputLabel>
      <Select
        labelId="chain-select-la"
        id="chain-select"
        value={environment.network}
        label="Chain"
        onChange={handleChange as any} //SelectChangeEvent can't be used here for some reason
      >
        <MenuItem value={"DEVNET"}>{"Tilt Devnet"}</MenuItem>
        <MenuItem value={"TESTNET"}>{"Testnet"}</MenuItem>
        <MenuItem value={"MAINNET"}>{"Mainnet"}</MenuItem>
      </Select>
    </FormControl>
  );
}
