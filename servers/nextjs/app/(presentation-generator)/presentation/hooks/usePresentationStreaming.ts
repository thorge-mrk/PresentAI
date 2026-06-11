import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  clearPresentationData,
  setPresentationData,
  setStreaming,
} from "@/store/slices/presentationGeneration";
import { notify } from "@/components/ui/sonner";
import { getPresentation, slidesToPresentationData } from "@/lib/presentation-api";

export const usePresentationStreaming = (
  presentationId: string,
  stream: string | null,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void,
  fetchUserSlides: () => void
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // If no stream flag, just load from Supabase normally
    if (!stream) {
      fetchUserSlides();
      return;
    }

    // With stream flag: presentation was just generated, load slides from Supabase
    setLoading(true);
    dispatch(setStreaming(true));
    dispatch(clearPresentationData());

    getPresentation(presentationId)
      .then(({ presentation, slides }) => {
        if (!slides || slides.length === 0) {
          throw new Error("Keine Folien gefunden");
        }
        const presData = slidesToPresentationData(presentation, slides);
        dispatch(setPresentationData(presData as any));
        dispatch(setStreaming(false));
        setLoading(false);

        // Remove stream param from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("stream");
        window.history.replaceState({}, "", newUrl.toString());
      })
      .catch((err) => {
        dispatch(setStreaming(false));
        setLoading(false);
        setError(true);
        notify.error("Präsentation laden fehlgeschlagen", err.message || "Unbekannter Fehler");
      });
  }, [presentationId, stream, dispatch, setLoading, setError, fetchUserSlides]);
};
