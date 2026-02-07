import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatInterface from "./ChatInterface";

const Chat = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"chat" | "visual">("chat");

  const handleToggleVisualMode = () => {
    navigate("/visual");
  };

  if (mode === "visual") {
    navigate("/visual");
    return null;
  }

  return (
    <div className="w-full h-screen">
      <ChatInterface onToggleVisualMode={handleToggleVisualMode} />
    </div>
  );
};

export default Chat;
