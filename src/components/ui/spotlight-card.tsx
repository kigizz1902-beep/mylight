"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GlowColor = "blue" | "purple" | "green" | "red" | "orange";
export type GlowSize = "sm" | "md" | "lg";

export interface GlowCardProps {
  children?: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  size?: GlowSize;
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
  /** Rendered as `data-testid` on the interactive surface, for test targeting only. */
  dataTestId?: string;
}

/** RGB triplets so the glow can share opacity via `rgb(var(--spotlight-color) / <alpha>)`. */
const GLOW_COLOR_MAP: Record<GlowColor, string> = {
  blue: "59 130 246",
  purple: "168 85 247",
  green: "34 197 94",
  red: "239 68 68",
  orange: "180 108 42",
};

const SIZE_MAP: Record<GlowSize, React.CSSProperties> = {
  sm: { width: "16rem", height: "16rem" },
  md: { width: "20rem", height: "20rem" },
  lg: { width: "28rem", height: "34rem" },
};

function toDimension(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * A card whose glow follows the pointer and bleeds faintly from its border.
 * Position/opacity are written straight to CSS variables on the node (not React state)
 * so pointer movement never triggers a re-render.
 */
export const SpotlightCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  function SpotlightCard(
    {
      children,
      className,
      glowColor = "orange",
      size = "md",
      width,
      height,
      customSize = false,
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ariaLabel,
      dataTestId,
    },
    forwardedRef,
  ) {
    const nodeRef = React.useRef<HTMLDivElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        nodeRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    React.useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      let frame: number | null = null;

      const setPosition = (clientX: number, clientY: number) => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        node.style.setProperty("--spotlight-x", `${x}%`);
        node.style.setProperty("--spotlight-y", `${y}%`);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (frame !== null) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          setPosition(event.clientX, event.clientY);
        });
      };

      const handlePointerDown = (event: PointerEvent) => {
        setPosition(event.clientX, event.clientY);
        node.style.setProperty("--spotlight-opacity", "1");
      };

      const handlePointerEnter = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        node.style.setProperty("--spotlight-opacity", "1");
      };

      const handlePointerLeave = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        node.style.setProperty("--spotlight-opacity", "0.3");
      };

      node.addEventListener("pointermove", handlePointerMove);
      node.addEventListener("pointerdown", handlePointerDown);
      node.addEventListener("pointerenter", handlePointerEnter);
      node.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        node.removeEventListener("pointermove", handlePointerMove);
        node.removeEventListener("pointerdown", handlePointerDown);
        node.removeEventListener("pointerenter", handlePointerEnter);
        node.removeEventListener("pointerleave", handlePointerLeave);
        if (frame !== null) cancelAnimationFrame(frame);
      };
    }, []);

    const dimensionStyle: React.CSSProperties = customSize
      ? {
          width: toDimension(width) ?? "100%",
          height: toDimension(height) ?? "100%",
        }
      : SIZE_MAP[size];

    const styleVars = {
      ...dimensionStyle,
      "--spotlight-color": GLOW_COLOR_MAP[glowColor],
      "--spotlight-x": "50%",
      "--spotlight-y": "50%",
      "--spotlight-opacity": 0.3,
    } as React.CSSProperties;

    return (
      <div className="relative" style={{ width: dimensionStyle.width, height: dimensionStyle.height }}>
        {/* Border-leak glow: sits behind the clipped card and blurs past its edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] blur-2xl transition-opacity duration-700"
          style={{
            opacity: "var(--spotlight-opacity)",
            background:
              "radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), rgb(var(--spotlight-color) / 0.45), transparent 70%)",
          }}
        />
        <div
          ref={setRefs}
          role={role}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          data-testid={dataTestId}
          onClick={onClick}
          onKeyDown={onKeyDown}
          style={styleVars}
          className={cn(
            "group relative isolate h-full w-full overflow-hidden rounded-[2rem]",
            className,
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
            style={{
              opacity: "var(--spotlight-opacity)",
              background:
                "radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), rgb(var(--spotlight-color) / 0.35), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
            style={{
              boxShadow: "inset 0 0 2px 1px rgb(var(--spotlight-color) / 0.25)",
            }}
          />
          <div className="relative z-0 h-full w-full">{children}</div>
        </div>
      </div>
    );
  },
);
