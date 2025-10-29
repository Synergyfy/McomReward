"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import InfoDialog from "@/components/ui/InfoDialog";

interface InfoDialogState {
  open: boolean;
  title: string;
  message: string;
  type: "success" | "error";
}

interface InfoDialogContextType {
  showDialog: (title: string, message: string, type: "success" | "error") => void;
}

const InfoDialogContext = createContext<InfoDialogContextType | undefined>(
  undefined
);

export const useInfoDialog = () => {
  const context = useContext(InfoDialogContext);
  if (!context) {
    throw new Error("useInfoDialog must be used within an InfoDialogProvider");
  }
  return context;
};

export const InfoDialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [dialogState, setDialogState] = useState<InfoDialogState>({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  const showDialog = useCallback(
    (title: string, message: string, type: "success" | "error") => {
      setDialogState({ open: true, title, message, type });
    },
    []
  );

  const handleClose = useCallback(() => {
    setDialogState((prevState) => ({ ...prevState, open: false }));
  }, []);

  return (
    <InfoDialogContext.Provider value={{ showDialog }}>
      {children}
      <InfoDialog
        open={dialogState.open}
        onClose={handleClose}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
    </InfoDialogContext.Provider>
  );
};
