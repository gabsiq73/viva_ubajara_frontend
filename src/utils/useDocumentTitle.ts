import { useEffect } from "react";

const SUFFIX = "Viva Ubajara";

export function useDocumentTitle(title: string | null) {
    useEffect(() => {
        if (!title) return;
        const previous = document.title;
        document.title = `${title} · ${SUFFIX}`;
        return () => {
            document.title = previous;
        };
    }, [title]);
}
