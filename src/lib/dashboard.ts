export type DashboardWidgetId = "playlist" | "continue" | "suggestions" | "my-list";

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetId[] = [
  "playlist",
  "continue",
  "suggestions",
  "my-list",
];

export const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  playlist: "Tonight",
  continue: "Continue watching",
  suggestions: "You might like",
  "my-list": "My List",
};

export function moveDashboardWidget(
  order: DashboardWidgetId[],
  widget: DashboardWidgetId,
  direction: "up" | "down",
): DashboardWidgetId[] {
  const index = order.indexOf(widget);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return order;
  const next = [...order];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export function sanitizeDashboardWidgets(value: unknown): DashboardWidgetId[] {
  if (!Array.isArray(value)) return [...DEFAULT_DASHBOARD_WIDGETS];
  const valid = value.filter((item): item is DashboardWidgetId =>
    DEFAULT_DASHBOARD_WIDGETS.includes(item as DashboardWidgetId),
  );
  return Array.from(new Set(valid)).concat(DEFAULT_DASHBOARD_WIDGETS.filter((item) => !valid.includes(item)));
}
