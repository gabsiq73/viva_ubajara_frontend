import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Outcome<T> = { ok: true; data: T } | { ok: false; error: unknown };

export type AsyncData<T> =
    | { status: "loading"; retry: () => void }
    | { status: "error"; error: unknown; retry: () => void }
    | { status: "ready"; data: T; retry: () => void };

/**
 * Carrega dados atrelados a uma chave (ex.: id da rota). Mudar a chave ou chamar `retry`
 * volta a "loading" sem setState no efeito: o resultado só vale para a chave que o gerou.
 */
export function useAsyncData<T>(load: () => Promise<T>, key: string): AsyncData<T> {
    const [attempt, setAttempt] = useState(0);
    const [loaded, setLoaded] = useState<{ key: string; outcome: Outcome<T> } | null>(null);
    const loadRef = useRef(load);
    const requestKey = `${key}|${attempt}`;

    useEffect(() => {
        loadRef.current = load;
    });

    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(() => loadRef.current()).then(
            (data) => {
                if (!cancelled) setLoaded({ key: requestKey, outcome: { ok: true, data } });
            },
            (error: unknown) => {
                if (!cancelled) setLoaded({ key: requestKey, outcome: { ok: false, error } });
            },
        );
        return () => {
            cancelled = true;
        };
    }, [requestKey]);

    const retry = () => setAttempt((n) => n + 1);
    const outcome = loaded?.key === requestKey ? loaded.outcome : null;
    if (!outcome) return { status: "loading", retry };
    return outcome.ok ? { status: "ready", data: outcome.data, retry } : { status: "error", error: outcome.error, retry };
}

/** 404 (ou 400 de id malformado) = o registro não existe; qualquer outra falha é erro de carga. */
export function isNotFoundError(error: unknown): boolean {
    return error instanceof MissingRecordError || (axios.isAxiosError(error) && [400, 404].includes(error.response?.status ?? 0));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class MissingRecordError extends Error {}

/** A API responde 401 (e a sessão é derrubada) para id malformado; barra antes de chamar. */
export function requireUuid(id: string): void {
    if (!UUID.test(id)) throw new MissingRecordError();
}
