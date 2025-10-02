import { createContext, useContext, type ReactNode } from "react";
import { message } from "antd";

interface MessageContextType {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
  contextHolder: React.ReactNode;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (text: string) => messageApi.open({ type: "success", content: text });
  const error = (text: string) => messageApi.open({ type: "error", content: text });
  const info = (text: string) => messageApi.open({ type: "info", content: text });

  return (
    <MessageContext.Provider value={{ success, error, info, contextHolder }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessage must be used within a MessageProvider");
  return context;
};
