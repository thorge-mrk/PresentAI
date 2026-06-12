"use client";

/**
 * Custom templates were a FastAPI feature (server-compiled user layouts).
 * The cloud version ships with built-in templates only, so these hooks are
 * inert stubs that keep the template selection UI compiling.
 */

import { CompiledLayout } from "./compileLayout";

export interface TemplateSummary {
  id: string;
  name: string;
  total_layouts: number;
}

export interface CustomTemplateLayout extends CompiledLayout {
  templateId: string;
  rawLayoutId: string;
  rawLayoutName: string;
  layoutCode: string;
  fonts?: string[];
}

export interface CustomTemplateDetail {
  layouts: CustomTemplateLayout[];
  name: string;
  description: string;
  id: string;
  template: unknown;
  fonts?: string[];
}

export interface CustomTemplates {
  id: string;
  name: string;
  layoutCount: number;
  isCustom: true;
}

export async function getCustomTemplateFirstSlidePreview(
  _presentationIdOrCustomId: string
): Promise<CompiledLayout | null> {
  return null;
}

export async function getCustomTemplateDetails(
  _id: string,
  _name?: string,
  _description?: string
): Promise<CustomTemplateDetail | null> {
  return null;
}

export function useCustomTemplateSummaries() {
  return {
    templates: [] as CustomTemplates[],
    loading: false,
    error: null as string | null,
    refetch: () => {},
  };
}

export function useCustomTemplateDetails(_templateDetail: {
  id: string;
  name: string;
  description: string;
}) {
  return {
    template: null as CustomTemplateDetail | null,
    loading: false,
    error: null as string | null,
    refetch: () => {},
    fonts: [] as string[],
  };
}

export function useCustomTemplatePreview(_presentationId: string) {
  return { previewLayouts: [] as CompiledLayout[], loading: false };
}

export function useCustomTemplateFirstSlidePreview(_presentationIdOrCustomId: string) {
  return {
    previewLayout: null as CompiledLayout | null,
    loading: false,
    error: null as string | null,
  };
}
