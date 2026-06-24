import React from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "../types/index";
import { ChevronRight } from "lucide-react";

interface GenerateButtonProps {
  loadingState: LoadingState;
  streamState: { isStreaming: boolean; isLoading: boolean };
  onSubmit: () => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  loadingState,
  streamState,
  onSubmit,
}) => {
  const isDisabled =
    loadingState.isLoading || streamState.isLoading || streamState.isStreaming;

  const getButtonText = () => {
    if (loadingState.isLoading) return loadingState.message;
    if (streamState.isLoading || streamState.isStreaming) return "Lädt…";
    return "Präsentation generieren";
  };

  return (
    <Button
      disabled={isDisabled}
      onClick={() => {
        onSubmit();
      }}
      className="w-full flex items-center gap-1 rounded-[58px] text-sm py-3 px-5 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: "var(--mint-500)", boxShadow: "0 8px 18px -10px rgba(20,184,166,0.65)" }}
    >
      {getButtonText()}
      <ChevronRight className="w-4 h-4" />
    </Button>
  );
};

export default GenerateButton;
