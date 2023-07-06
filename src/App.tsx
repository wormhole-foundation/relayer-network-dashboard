import ContractStateInternals from "./views/contractStateInternals";
import { LoggerProvider } from "./context/LoggerContext";

import React from "react";
import * as ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { ContractStateProvider } from "./context/ContractStateContext";
import { EthereumProviderProvider } from "./context/EthereumProviderContext";
import { EnvironmentProvider } from "./context/EnvironmentContext";

function App() {
  //TODO persisted log watcher object

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EnvironmentProvider>
        <LoggerProvider>
          <EthereumProviderProvider>
            <ContractStateProvider>
              <ContractStateInternals />
            </ContractStateProvider>
          </EthereumProviderProvider>
        </LoggerProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  );
}

export default App;
