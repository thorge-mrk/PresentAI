"use client";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { notify } from "@/components/ui/sonner";
import { clearPresentationData, setPresentationData } from "@/store/slices/presentationGeneration";
import { LoadingState, TABS } from "../types/index";
import { TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import { approveOutline, slidesToPresentationData } from "@/lib/presentation-api";

const DEFAULT_LOADING: LoadingState = { message: "", isLoading: false, showProgress: false, duration: 0 };

export const usePresentationGeneration = (
  presentationId: string | null,
  outlines: { content: string }[] | null,
  selectedTemplate: TemplateLayoutsWithSettings | string | null,
  setActiveTab: (tab: string) => void
) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>(DEFAULT_LOADING);

  const handleSubmit = useCallback(async () => {
    if (!outlines || outlines.length === 0) {
      notify.warning("Gliederung nicht bereit", "Bitte warte bis die Gliederung fertig generiert ist.");
      return;
    }
    if (!presentationId) return;

    setLoadingState({ message: "Präsentation wird generiert...", isLoading: true, showProgress: true, duration: 60 });

    try {
      const { presentation, slides } = await approveOutline(presentationId);
      const presData = slidesToPresentationData(presentation, slides);
      dispatch(clearPresentationData());
      dispatch(setPresentationData(presData as any));
      router.replace(`/presentation?id=${presentationId}`);
    } catch (err: any) {
      notify.error("Generierungsfehler", err.message || "Fehler bei der Präsentationsgenerierung");
    } finally {
      setLoadingState(DEFAULT_LOADING);
    }
  }, [presentationId, outlines, dispatch, router]);

  return { loadingState, handleSubmit };
};
