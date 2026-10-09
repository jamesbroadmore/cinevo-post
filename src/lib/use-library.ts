import { useMemo } from "react";
import { useCinevo } from "./cinevo-store";
import { applySourceFilter } from "./library";
import { applyTitlePatch } from "./house-tools";

export { applySourceFilter };

export function useLibrary() {
  const local = useCinevo((s) => s.localTitles);
  const remote = useCinevo((s) => s.remoteTitles);
  const filter = useCinevo((s) => s.sourceFilter);
  const activeSourceId = useCinevo((s) => s.activeSourceId);
  const sources = useCinevo((s) => s.sources);
  const patches = useCinevo((s) => s.patches);
  return useMemo(() => {
    let pool = applySourceFilter(filter, local, remote).map((title) => applyTitlePatch(title, patches[title.id]));
    if (activeSourceId && activeSourceId !== "all") {
      const source = sources.find((item) => item.id === activeSourceId);
      if (source) {
        pool = pool.filter(
          (title) => title.sourceLabel === source.name || title.sourceLabel?.startsWith(`${source.name} ·`),
        );
      }
    }
    return pool;
  }, [local, remote, filter, activeSourceId, sources, patches]);
}