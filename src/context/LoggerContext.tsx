import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface LoggerContext {
  log: (value: string, type?: "error" | "info" | "success" | undefined) => void;
  clear: () => void;
  logs: string[];
}

const LoggerProviderContext = React.createContext<LoggerContext>({
  log: (value: string, type?: "error" | "info" | "success" | undefined) => {},
  clear: () => {},
  logs: [],
});

export const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<string[]>(["Instantiated the logger."]);
  const clear = useCallback(() => setLogs([]), [setLogs]);

  const log = useCallback(
    (value: string, type?: "error" | "info" | "success" | undefined) => {
      setLogs((logs: any) => [...logs, value]);
      if (type === "error") {
        console.error(value);
      } else if (type === "success") {
        console.log(value);
      } else if (type === "info") {
        console.log(value);
      } else {
        console.log(value);
      }
    },
    [setLogs]
  );

  const contextValue = useMemo(
    () => ({
      logs,
      clear,
      log,
    }),
    [logs, clear, log]
  );
  return (
    <LoggerProviderContext.Provider value={contextValue}>
      {children}
    </LoggerProviderContext.Provider>
  );
};
export const useLogger = () => {
  return useContext(LoggerProviderContext);
};
