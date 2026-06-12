import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { notify } from "@/components/ui/sonner";
import { setPresentationData } from "@/store/slices/presentationGeneration";
import { clearHistory } from "@/store/slices/undoRedoSlice";
import { getPresentation, slidesToPresentationData } from "@/lib/presentation-api";

export const usePresentationData = (
  presentationId: string,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void
) => {
  const dispatch = useDispatch();

  const fetchUserSlides = useCallback(async (options?: { clearHistory?: boolean }) => {
    try {
      const { presentation, slides } = await getPresentation(presentationId);
      const presData = slidesToPresentationData(presentation, slides);

      dispatch(setPresentationData(presData as any));
      if (options?.clearHistory ?? true) {
        dispatch(clearHistory());
      }
      setLoading(false);
    } catch (error) {
      setError(true);
      notify.error("Failed to load presentation", "The presentation could not be loaded. Please try again.");
      console.error("Error fetching user slides:", error);
      setLoading(false);
    }
  }, [presentationId, dispatch, setLoading, setError]);

  return {
    fetchUserSlides,
  };
};
