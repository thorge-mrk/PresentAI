function Shimmer({ className }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-md ${className ?? ""}`}
            style={{ backgroundColor: "var(--bg-muted)" }}
            aria-hidden
        />
    );
}

export default function LoadingSettings() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", padding: 32 }}>
            <div style={{ maxWidth: 640 }}>
                <div style={{ marginBottom: 36 }}>
                    <Shimmer className="h-3 w-24 mb-3" />
                    <Shimmer className="h-7 w-40" />
                </div>
                <div className="flex flex-col gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 16,
                                padding: "16px 20px",
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--bg-muted)",
                                borderRadius: 16,
                            }}
                        >
                            <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
                            <div className="flex-1">
                                <Shimmer className="h-4 w-40 mb-2.5" />
                                <Shimmer className="h-3 w-full max-w-[320px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
