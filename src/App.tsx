import ContractStateInternals from "./views/contractStateInternals";
import { LoggerProvider } from "./context/LoggerContext";

import React from "react";
import * as ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

function App() {
  //TODO persisted log watcher object

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoggerProvider>
        <ContractStateInternals />
      </LoggerProvider>
    </ThemeProvider>
  );
}

export default App;
