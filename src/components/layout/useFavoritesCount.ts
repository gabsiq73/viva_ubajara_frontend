import { useSyncExternalStore } from "react";
import { loadFavorites } from "../../utils/favorites";

function subscribe(onChange: () => void): () => void {
    // favorites.ts não emite evento ao gravar na mesma aba; todo toggle nasce de um clique,
    // então relemos o storage logo após qualquer clique.
    const onClick = () => { window.setTimeout(onChange, 0); };
    window.addEventListener("storage", onChange);
    document.addEventListener("click", onClick);
    return () => {
        window.removeEventListener("storage", onChange);
        document.removeEventListener("click", onClick);
    };
}

export function useFavoritesCount(): number {
    return useSyncExternalStore(subscribe, () => loadFavorites().length, () => 0);
}
