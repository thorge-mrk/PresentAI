import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { useEffect, useState } from "react";
import BrandIcon from "@/components/BrandIcon";

interface OverlayLoaderProps {
  text?: string;
  className?: string;
  show: boolean;
  showProgress?: boolean;
  duration?: number;
  extra_info?: string;
  onProgressComplete?: () => void;
}

export const OverlayLoader = ({
  text,
  className,
  show,
  showProgress = false,
  duration = 10,
  onProgressComplete,
  extra_info,
}: OverlayLoaderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{ zIndex: 1000 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
        "bg-black/60 backdrop-blur-sm",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-premium)",
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-6 px-8 py-10 relative",
          "w-[90%] max-w-[420px] transition-all duration-300 ease-out",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
          className
        )}
      >
        {/* Brand icon with a pulsing teal ring */}
        <div className="orately-loader-badge" aria-hidden>
          <span className="orately-loader-ring" />
          <BrandIcon size={56} />
        </div>

        <div className="w-full space-y-4">
          {showProgress && (
            <ProgressBar duration={duration} onComplete={onProgressComplete} />
          )}
          {text && (
            <div className="space-y-1.5">
              <p
                className="text-center text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {text}
              </p>
              {extra_info && (
                <p
                  className="text-center text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {extra_info}
                </p>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .orately-loader-badge {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 84px;
            height: 84px;
          }
          .orately-loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border: 3px solid var(--mint-500, #14b8a6);
            border-top-color: transparent;
            border-right-color: transparent;
            opacity: 0.85;
            animation: orately-spin 0.9s linear infinite;
          }
          @keyframes orately-spin {
            to {
              transform: rotate(1turn);
            }
          }
        `}</style>
      </div>
    </div>
  );
};
