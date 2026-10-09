import { cn } from "@/lib/utils";

/** Official CINEVO play-crystal (Logo Kit v1.0). Do not recolor, rotate, or stroke. */
const FACETS = [
  { d: "80.32,51.04 80.32,460.96 207.2,260.88", fill: "#FF4DA5" },
  { d: "80.32,460.96 451.2,256 207.2,260.88", fill: "#FF9F1C" },
  { d: "80.32,51.04 295.4304,169.9168 207.2,260.88", fill: "#8B2FFF" },
  { d: "295.4304,169.9168 451.2,256 207.2,260.88", fill: "#55CFFF" },
  { d: "391.8592,223.2064 451.2,256 391.8592,288.7936", fill: "#C8F0FF" },
];

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("brand__gem", className)} aria-hidden="true">
      {FACETS.map((f) => (
        <polygon key={f.fill} points={f.d} fill={f.fill} />
      ))}
    </svg>
  );
}

export function Logo({
  size = "md",
  className,
  tagline = true,
  layout,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  tagline?: boolean;
  layout?: "horizontal" | "stacked";
}) {
  const lockup = layout ?? (size === "lg" || size === "xl" ? "stacked" : "horizontal");
  const showTag = tagline && size !== "sm";
  return (
    <span className={cn("brand", className)} data-size={size} data-layout={lockup}>
      <Mark />
      <span>
        <b>CINEVO</b>
        {showTag ? <small>Your media. Your moment.</small> : null}
      </span>
    </span>
  );
}

export function BrandKicker({ children = "CINEVO" }: { children?: React.ReactNode }) {
  return (
    <p className="brand-kicker">
      <Mark />
      <span>{children}</span>
    </p>
  );
}

export function BrandWatermark({ className }: { className?: string }) {
  return (
    <span className={cn("brand-watermark", className)} aria-hidden="true">
      <Mark />
      <b>CINEVO</b>
    </span>
  );
}
