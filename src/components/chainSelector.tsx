import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getEnvironment } from "../utils/environment";
import { ChainId } from "@certusone/wormhole-sdk";
import { useEffect, useState } from "react";

export default function ChainSelector(props: {
  onChainSelected: (chainId: ChainId) => void;
}) {
  const env = getEnvironment();
  const [selectedValue, setSelectedValue] = useState<ChainId>(
    env.chainInfos[0].chainId
  );

  const allChains = env.chainInfos.map((chainInfo) => {
    return (
      <MenuItem value={chainInfo.chainId}>
        {chainInfo.chainId + " - " + chainInfo.chainName}
      </MenuItem>
    );
  });

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    const chainId = event.target.value as ChainId;
    setSelectedValue(chainId);
    props.onChainSelected(chainId);
  };

  useEffect(() => {
    props.onChainSelected(selectedValue);
  }, []);

  return (
    <FormControl style={{ margin: "10px", minWidth: "150px" }}>
      <InputLabel>Chain</InputLabel>
      <Select
        labelId="chain-select-la"
        id="chain-select"
        value={selectedValue}
        label="Chain"
        onChange={handleChange as any} //SelectChangeEvent can't be used here for some reason
      >
        {allChains}
      </Select>
    </FormControl>
  );
}
