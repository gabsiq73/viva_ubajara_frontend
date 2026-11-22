import { useState } from "react";

/** Vira `show: false` quando a URL atual falha ao carregar, para o chamador cair no fallback; trocar a URL tenta de novo. */
export function useBrokenImage(src?: string | null) {
    const [broken, setBroken] = useState<string | null>(null);
    return { show: !!src && broken !== src, onError: () => setBroken(src ?? null) };
}
