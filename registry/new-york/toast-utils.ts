export type ToastKind =
  | "action"
  | "error"
  | "info"
  | "loading"
  | "success"
  | "warning";

export interface ToastDurationInput {
  action?: boolean;
  description?: unknown;
  duration?: number;
  type?: ToastKind;
}

export const getToastDuration = ({
  action = false,
  description,
  duration,
  type,
}: ToastDurationInput): number => {
  if (type === "loading") {
    return 0;
  }
  if (duration !== undefined) {
    return Math.max(0, duration);
  }
  return description || action ? 4000 : 3000;
};

export const getToastMessage = (_error?: unknown): string =>
  "Something went wrong. Please try again.";

/** A continuous stepped surface; identical command topology allows path morphing. */
export const getToastSurfacePath = ({
  width,
  height,
  head,
  pill,
  start,
  opened,
}: {
  width: number;
  height: number;
  head: number;
  pill: number;
  start: number;
  opened: boolean;
}) => {
  const end = start + pill;
  const left = opened ? 0 : start;
  const right = opened ? width : end;
  const top = opened ? head - 4 : head - 24;
  const bottom = opened ? height : head;
  const cornerLeft = opened && start > 0 ? 20 : 0;
  const cornerRight = opened && end < width ? 20 : 0;
  const shoulderLeft = opened ? Math.min(16, start / 2) : 0;
  const shoulderRight = opened ? Math.min(16, (width - end) / 2) : 0;
  return `M${start + 24} 0 H${end - 24} Q${end} 0 ${end} 24 V${top - shoulderRight} Q${end} ${top} ${end + shoulderRight} ${top} H${right - cornerRight} Q${right} ${top} ${right} ${top + cornerRight} V${bottom - 24} Q${right} ${bottom} ${right - 24} ${bottom} H${left + 24} Q${left} ${bottom} ${left} ${bottom - 24} V${top + cornerLeft} Q${left} ${top} ${left + cornerLeft} ${top} H${start - shoulderLeft} Q${start} ${top} ${start} ${top - shoulderLeft} V24 Q${start} 0 ${start + 24} 0 Z`;
};
