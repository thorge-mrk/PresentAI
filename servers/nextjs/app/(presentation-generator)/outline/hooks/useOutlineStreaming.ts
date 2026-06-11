import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "@/components/ui/sonner";
import { setOutlines } from "@/store/slices/presentationGeneration";
import { RootState } from "@/store/store";
import { getPresentation } from "@/lib/presentation-api";

export const useOutlineStreaming = (presentationId: string | null) => {
  const dispatch = useDispatch();
  const { outlines } = useSelector((state: RootState) => state.presentationGeneration);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlideIndex] = useState<number | null>(null);
  const [highestActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (!presentationId || outlines.length > 0) {
      setIsStreaming(false);
      setIsLoading(false);
      return;
    }

    setIsStreaming(true);
    setIsLoading(true);

    getPresentation(presentationId)
      .then(({ outlines: loaded }) => {
        const reduxOutlines = loaded.map((o) => ({
          content: `**${o.title}**\n${o.section} – ${o.visualDescription}`,
        }));
        dispatch(setOutlines(reduxOutlines));
      })
      .catch((err) => {
        notify.error("Outline laden fehlgeschlagen", err.message || "Unbekannter Fehler");
      })
      .finally(() => {
        setIsStreaming(false);
        setIsLoading(false);
      });
  }, [presentationId, dispatch]);

  return { isStreaming, isLoading, activeSlideIndex, highestActiveIndex };
};
