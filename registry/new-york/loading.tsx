"use client";

import { cn } from "cn";
import { useReducedMotion } from "motion/react";
import type { ComponentProps, ComponentType, CSSProperties } from "react";

import { AccordionLoader } from "@/components/loading-ui/accordion-loader";
import { AnalyzingImage } from "@/components/loading-ui/analyzing-image";
import { Arc } from "@/components/loading-ui/arc";
import { Bars } from "@/components/loading-ui/bars";
import { BobbingDots } from "@/components/loading-ui/bobbing-dots";
import { BouncingDots } from "@/components/loading-ui/bouncing-dots";
import { Classic } from "@/components/loading-ui/classic";
import { ClockRing } from "@/components/loading-ui/clock-ring";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { ConcentricRing } from "@/components/loading-ui/concentric-ring";
import { ConveyorLoop } from "@/components/loading-ui/conveyor-loop";
import { DashRing } from "@/components/loading-ui/dash-ring";
import { Diamond } from "@/components/loading-ui/diamond";
import { Dots } from "@/components/loading-ui/dots";
import { DotsRing } from "@/components/loading-ui/dots-ring";
import { DualArc } from "@/components/loading-ui/dual-arc";
import { FadeArc } from "@/components/loading-ui/fade-arc";
import { InfinityLoop } from "@/components/loading-ui/infinity";
import { InfinitySquareSnake } from "@/components/loading-ui/infinity-square-snake";
import { InfinityTrack } from "@/components/loading-ui/infinity-track";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";
import { OrbitRing } from "@/components/loading-ui/orbit-ring";
import { PulsatingDots } from "@/components/loading-ui/pulsating-dots";
import { Pulse } from "@/components/loading-ui/pulse";
import { PulseDot } from "@/components/loading-ui/pulse-dot";
import { QuarterRing } from "@/components/loading-ui/quarter-ring";
import { Ring } from "@/components/loading-ui/ring";
import { Ripple } from "@/components/loading-ui/ripple";
import { SatelliteRing } from "@/components/loading-ui/satellite-ring";
import { Skeleton } from "@/components/loading-ui/skeleton";
import { Spiral } from "@/components/loading-ui/spiral";
import { Spokes } from "@/components/loading-ui/spokes";
import { SquareAccordion } from "@/components/loading-ui/square-accordion";
import { SquareGrid } from "@/components/loading-ui/square-grid";
import { SquareSnake } from "@/components/loading-ui/square-snake";
import { Swirling } from "@/components/loading-ui/swirling";
import { SymmetricWave } from "@/components/loading-ui/symmetric-wave";
import { Terminal } from "@/components/loading-ui/terminal";
import { TextBlink } from "@/components/loading-ui/text-blink";
import { TextDots } from "@/components/loading-ui/text-dots";
import { TextShimmer } from "@/components/loading-ui/text-shimmer";
import { TextShimmerWave } from "@/components/loading-ui/text-shimmer-wave";
import { TripleDotSpinner } from "@/components/loading-ui/triple-dot-spinner";
import { TwinOrbit } from "@/components/loading-ui/twin-orbit";
import { Typing } from "@/components/loading-ui/typing";
import { WanderingEyes } from "@/components/loading-ui/wandering-eyes";
import { Wave } from "@/components/loading-ui/wave";

import { LoadingArc } from "./loading-arc";
import type { LoadingVariant } from "./loading-variants";
export { loadingVariants, type LoadingVariant } from "./loading-variants";

// Original animations: https://github.com/turbostarter/loading-ui (MIT).
// The registry includes a versioned snapshot as editable source.
const loadingComponents = {
  "accordion-loader": AccordionLoader,
  "analyzing-image": AnalyzingImage,
  arc: Arc,
  bars: Bars,
  "bobbing-dots": BobbingDots,
  "bouncing-dots": BouncingDots,
  classic: Classic,
  "clock-ring": ClockRing,
  "comet-spinner": CometSpinner,
  "concentric-ring": ConcentricRing,
  "conveyor-loop": ConveyorLoop,
  "dash-ring": DashRing,
  diamond: Diamond,
  dots: Dots,
  "dots-ring": DotsRing,
  "dual-arc": DualArc,
  "fade-arc": FadeArc,
  infinity: InfinityLoop,
  "infinity-square-snake": InfinitySquareSnake,
  "infinity-track": InfinityTrack,
  "morphing-infinity": MorphingInfinity,
  "orbit-ring": OrbitRing,
  "pulsating-dots": PulsatingDots,
  pulse: Pulse,
  "pulse-dot": PulseDot,
  "quarter-ring": QuarterRing,
  ring: Ring,
  ripple: Ripple,
  "satellite-ring": SatelliteRing,
  skeleton: Skeleton,
  spiral: Spiral,
  spokes: Spokes,
  "square-accordion": SquareAccordion,
  "square-grid": SquareGrid,
  "square-snake": SquareSnake,
  swirling: Swirling,
  "symmetric-wave": SymmetricWave,
  terminal: Terminal,
  "text-blink": TextBlink,
  "text-dots": TextDots,
  "text-shimmer": TextShimmer,
  "text-shimmer-wave": TextShimmerWave,
  "triple-dot-spinner": TripleDotSpinner,
  "twin-orbit": TwinOrbit,
  typing: Typing,
  "wandering-eyes": WanderingEyes,
  wave: Wave,
} as const satisfies Record<LoadingVariant, unknown>;

type LoadingBaseProps = Omit<ComponentProps<"div">, "children"> & {
  /** Base visual size in pixels, or a CSS length. Glyph/text variants use it as font size. */
  size?: number | string;
  /** CSS-based cycle duration in seconds. Fixed Motion/SMIL timings remain upstream defaults. */
  duration?: number;
  /** Visible content for the four text variants. */
  text?: string;
};

type SelectedLoadingProps = LoadingBaseProps &
  {
    [Variant in LoadingVariant]: {
      variant: Variant;
      variantProps?: Omit<
        ComponentProps<(typeof loadingComponents)[Variant]>,
        "children" | "ref"
      >;
    };
  }[LoadingVariant];

type DefaultLoadingProps = LoadingBaseProps & {
  variant?: "arc";
  variantProps?: Omit<ComponentProps<typeof Arc>, "children" | "ref">;
};

export type LoadingProps =
  | SelectedLoadingProps
  | DefaultLoadingProps
  | (LoadingBaseProps & {
      variant: LoadingVariant;
      variantProps?: never;
    });

const glyphVariants = new Set<LoadingVariant>([
  "accordion-loader",
  "conveyor-loop",
  "infinity-square-snake",
  "infinity-track",
  "square-accordion",
  "square-grid",
  "square-snake",
  "symmetric-wave",
  "terminal",
]);

const visualClassName = (variant: LoadingVariant) => {
  if (variant.startsWith("text-") || glyphVariants.has(variant)) {
    return "text-[length:var(--loading-size)]";
  }
  if (variant === "skeleton") {
    return "h-[calc(var(--loading-size)/2)] w-[calc(var(--loading-size)*4)]";
  }
  if (variant === "wandering-eyes") {
    return "h-(--loading-size) w-[calc(var(--loading-size)*2.25)]";
  }
  if (variant === "twin-orbit" || variant === "triple-dot-spinner") {
    return "size-[calc(var(--loading-size)/3)]";
  }
  return "size-(--loading-size)";
};

const StaticLoading = ({ isText, text }: { isText: boolean; text: string }) => {
  if (isText) {
    return <span className="text-[length:var(--loading-size)]">{text}</span>;
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-(--loading-size)">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Loading = ({
  variant = "arc",
  variantProps,
  size = 24,
  duration,
  text = "Loading",
  className,
  style,
  "aria-label": ariaLabel = "Loading",
  ...props
}: LoadingProps) => {
  const reducedMotion = useReducedMotion();
  if (variant === "arc" && !variantProps) {
    return (
      <LoadingArc
        {...props}
        size={size}
        className={className}
        aria-label={ariaLabel}
        style={
          {
            ...(duration === undefined ? {} : { "--duration": `${duration}s` }),
            ...style,
          } as CSSProperties
        }
      />
    );
  }
  // The public discriminated union validates each variant's own props. The common
  // rendering boundary only adds className and string children to text components.
  const Component = loadingComponents[variant] as ComponentType<{
    className?: string;
    children?: string;
  }>;
  const isText = variant.startsWith("text-");
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      data-slot="loading"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center justify-center align-middle",
        className
      )}
      style={
        {
          "--loading-size": typeof size === "number" ? `${size}px` : size,
          ...(duration === undefined ? {} : { "--duration": `${duration}s` }),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div
        aria-hidden="true"
        data-slot="loading-visual"
        className="inline-flex items-center justify-center"
      >
        {reducedMotion ? (
          <StaticLoading isText={isText} text={text} />
        ) : (
          <Component
            {...(isText && variant !== "text-dots" ? { as: "span" } : {})}
            {...variantProps}
            {...(isText ? { children: text } : {})}
            className={cn(visualClassName(variant), variantProps?.className)}
          />
        )}
      </div>
    </div>
  );
};
