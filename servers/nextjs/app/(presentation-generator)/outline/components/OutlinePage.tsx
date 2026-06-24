"use client";

import React from "react";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import OutlineContent from "./OutlineContent";
import EmptyStateView from "./EmptyStateView";
import GenerateButton from "./GenerateButton";

import { useOutlineStreaming } from "../hooks/useOutlineStreaming";
import { useOutlineManagement } from "../hooks/useOutlineManagement";
import { usePresentationGeneration } from "../hooks/usePresentationGeneration";

const OutlinePage: React.FC = () => {
  const { presentation_id, outlines } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  // Custom hooks
  const streamState = useOutlineStreaming(presentation_id);
  const { handleDragEnd, handleAddSlide } = useOutlineManagement(outlines);
  const { loadingState, handleSubmit } = usePresentationGeneration(
    presentation_id,
    outlines
  );

  if (!presentation_id) {
    return <EmptyStateView />;
  }

  return (
    <div className="pb-9" style={{ backgroundColor: "var(--bg-base)" }}>
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
      />

      <Wrapper className="flex flex-col w-full relative px-5 sm:px-10 lg:px-20 pt-8">
        <div className="w-full mx-auto">
          <OutlineContent
            outlines={outlines}
            isLoading={streamState.isLoading}
            isStreaming={streamState.isStreaming}
            activeSlideIndex={streamState.activeSlideIndex}
            highestActiveIndex={streamState.highestActiveIndex}
            onDragEnd={handleDragEnd}
            onAddSlide={handleAddSlide}
          />

          <div className="fixed bottom-[26px] right-[26px] z-50">
            <GenerateButton
              loadingState={loadingState}
              streamState={streamState}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default OutlinePage;
