"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import { templates } from "@/app/presentation-templates";
import { TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import {
    useCustomTemplateSummaries,
    useCustomTemplatePreview,
    CustomTemplates,
} from "@/app/hooks/useCustomTemplates";
import CreateCustomTemplate from "./CreateCustomTemplate";
import Link from "next/link";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import {
    TemplatePreviewStage,
    LayoutsBadge,
    InbuiltTemplatePreview,
    CustomTemplatePreview,
} from "../../../components/TemplatePreviewComponents";

export const CustomTemplateCard = React.memo(function CustomTemplateCard({ template }: { template: CustomTemplates }) {
    const router = useRouter();
    const { previewLayouts, loading } = useCustomTemplatePreview(`${template.id}`);
    const handleOpen = useCallback(() => {
        trackEvent(MixpanelEvent.Templates_Custom_Opened, { template_id: template.id, template_name: template.name });
        if (template.id.startsWith('custom-')) {
            router.push(`/template-preview?slug=${template.id}`)
        } else {
            router.push(`/template-preview?slug=custom-${template.id}`)
        }
    }, [router, template.id, template.name]);

    return (
        <div
            className="cursor-pointer flex flex-col relative transition-all duration-200 group overflow-hidden"
            style={{ borderRadius: 22, border: "1px solid var(--bg-muted)", backgroundColor: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}
            onClick={handleOpen}
        >
            <TemplatePreviewStage>
                <LayoutsBadge count={template.layoutCount} />
                <CustomTemplatePreview
                    previewLayouts={previewLayouts}
                    loading={loading}
                    templateId={template.id}
                />
            </TemplatePreviewStage>
            <div className="relative z-40 flex items-center justify-between px-6 py-5" style={{ borderTop: "1px solid var(--bg-muted)", backgroundColor: "var(--bg-surface)" }}>
                <h3 className="max-w-[min(191px,65%)] text-base font-bold" style={{ color: "var(--text-primary)" }}>{template.name}</h3>
                <ArrowUpRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.template.id === next.template.id &&
        prev.template.name === next.template.name &&
        prev.template.layoutCount === next.template.layoutCount
    );
});

const InbuiltTemplateCard = React.memo(function InbuiltTemplateCard({
    template,
    onOpen,
}: {
    template: TemplateLayoutsWithSettings;
    onOpen: (id: string) => void;
}) {
    const handleOpen = useCallback(() => onOpen(template.id), [onOpen, template.id]);

    return (
        <div
            key={template.id}
            className="group relative cursor-pointer overflow-hidden transition-all duration-200"
            style={{ borderRadius: 22, border: "1px solid var(--bg-muted)", backgroundColor: "var(--bg-surface)", boxShadow: "var(--shadow-sm)" }}
            onClick={handleOpen}
        >
            <TemplatePreviewStage>
                <LayoutsBadge count={template.layouts.length} />
                <InbuiltTemplatePreview layouts={template.layouts} templateId={template.id} />
            </TemplatePreviewStage>
            <div className="relative z-40 flex items-center justify-between gap-4 px-6 py-5" style={{ borderTop: "1px solid var(--bg-muted)", backgroundColor: "var(--bg-surface)" }}>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold capitalize" style={{ color: "var(--text-primary)" }}>{template.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--text-secondary)" }}>{template.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
            </div>
        </div>
    );
});

const LayoutPreview = () => {
    const [tab, setTab] = useState<'custom' | 'default'>('default');
    const router = useRouter();
    const { templates: customTemplates, loading: customLoading } = useCustomTemplateSummaries();

    useEffect(() => {
        trackEvent(MixpanelEvent.Templates_Page_Viewed);
        const existingScript = document.querySelector('script[src*="tailwindcss.com"]');
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://cdn.tailwindcss.com";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const handleOpenPreview = useCallback((id: string) => {
        trackEvent(MixpanelEvent.Templates_Inbuilt_Opened, { template_id: id });
        router.push(`/template-preview?slug=${id}`);
    }, [router]);

    const { nonNeoInbuilt, neoInbuilt } = useMemo(() => {
        const nonNeo: TemplateLayoutsWithSettings[] = [];
        const neo: TemplateLayoutsWithSettings[] = [];
        for (const t of templates) {
            if (t.id.startsWith("neo")) neo.push(t);
            else nonNeo.push(t);
        }
        return { nonNeoInbuilt: nonNeo, neoInbuilt: neo };
    }, []);

    const customTemplateCards = useMemo(
        () => customTemplates.map((template: CustomTemplates) => <CustomTemplateCard key={template.id} template={template} />),
        [customTemplates],
    );

    return (
        <div className="min-h-screen  relative font-syne">
            <div className="sticky top-0 right-0 z-50 py-[28px] px-6   backdrop-blur ">
                <div className="flex xl:flex-row flex-col gap-6 xl:gap-0 items-center justify-between">
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                        Templates
                    </h3>
                    <div className="flex gap-2.5 max-sm:w-full max-md:justify-center max-sm:flex-wrap">
                        <Link
                            href="/custom-template"
                            onClick={() => trackEvent(MixpanelEvent.Templates_New_Template_Clicked)}
                            className="inline-flex items-center font-semibold gap-2 text-sm text-white"
                            aria-label="Create new template"
                            style={{
                                borderRadius: 10, padding: "8px 14px",
                                backgroundColor: "var(--mint-500)",
                                boxShadow: "0 6px 14px -8px rgba(20,184,166,0.65)",
                                textDecoration: "none",
                            }}
                        >
                            <span className="hidden md:inline">Neues Template</span>
                            <span className="md:hidden">Neu</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>

                    </div>
                </div>
            </div>

            <div className="l mx-auto px-6 py-8">
                <div className='p-1 w-fit flex items-center' style={{ borderRadius: 40, backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-muted)" }}>
                    <button className='px-5 py-2 text-xs font-medium'
                        onClick={() => { trackEvent(MixpanelEvent.Templates_Tab_Switched, { tab: 'custom' }); setTab('custom'); }}
                        style={{
                            borderRadius: 70, background: tab === 'custom' ? "var(--accent-pale)" : 'transparent',
                            color: tab === 'custom' ? "var(--accent)" : "var(--text-secondary)",
                            border: "none", cursor: "pointer",
                        }}
                    >Eigene</button>
                    <div style={{ width: 1, height: 17, backgroundColor: "var(--bg-muted)", margin: "0 4px" }} />
                    <button className='px-5 py-2 text-xs font-medium'
                        onClick={() => { trackEvent(MixpanelEvent.Templates_Tab_Switched, { tab: 'default' }); setTab('default'); }}
                        style={{
                            borderRadius: 70, background: tab === 'default' ? "var(--accent-pale)" : 'transparent',
                            color: tab === 'default' ? "var(--accent)" : "var(--text-secondary)",
                            border: "none", cursor: "pointer",
                        }}
                    >Standard</button>
                </div>

                {/* Inbuilt Templates Section: non-neo first, then Report (neo) */}
                {tab === 'default' && (
                    <section className="my-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {nonNeoInbuilt.map((template) => (
                                <InbuiltTemplateCard
                                    key={template.id}
                                    template={template}
                                    onOpen={handleOpenPreview}
                                />
                            ))}
                        </div>
                        {neoInbuilt.length > 0 && (
                            <div>
                                <h4 className="text-base font-semibold mb-6 tracking-tight" style={{ color: "var(--text-primary)" }}>
                                    Report
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {neoInbuilt.map((template) => (
                                        <InbuiltTemplateCard
                                            key={template.id}
                                            template={template}
                                            onOpen={handleOpenPreview}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}


                {tab === 'custom' && <section className="my-12">
                    {customLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Loading custom templates...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center lg:grid-cols-4 gap-6">
                            <CreateCustomTemplate />
                            {customTemplateCards}
                        </div>
                    )}
                </section>}
            </div>
        </div>
    );
};

export default LayoutPreview;
