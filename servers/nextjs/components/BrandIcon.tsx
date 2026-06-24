import React from "react";

/**
 * Official Orately brand icon (teal speech bubble).
 * Renders the correct variant for light/dark mode via CSS (class-based theme).
 * Both <img> tags are present; the inactive one is hidden with `.dark` rules
 * defined in globals.css, which avoids any hydration/flicker issues.
 */
export default function BrandIcon({
  size = 40,
  className = "",
  rounded,
}: {
  size?: number;
  className?: string;
  rounded?: number;
}) {
  const imgStyle: React.CSSProperties = {
    width: size,
    height: size,
    objectFit: "contain",
    ...(rounded ? { borderRadius: rounded } : {}),
  };
  return (
    <span
      className={className}
      style={{ display: "inline-flex", width: size, height: size, lineHeight: 0 }}
      aria-label="Orately"
    >
      <img src="/orately-icon-light.png" alt="Orately" className="brand-icon__light" style={imgStyle} draggable={false} />
      <img src="/orately-icon-dark.png" alt="Orately" className="brand-icon__dark" style={imgStyle} draggable={false} />
    </span>
  );
}
