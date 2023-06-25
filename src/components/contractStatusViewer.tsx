import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getEnvironment } from "../utils/environment";

export default function ContractStateInternals() {
  const environment = getEnvironment();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      ></AccordionSummary>
      <AccordionDetails></AccordionDetails>
    </Accordion>
  );
}
