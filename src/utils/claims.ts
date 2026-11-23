import axios from "axios";
import type { ClaimStatus, EstablishmentType } from "../admin/types";
import { establishmentPath } from "./establishments";

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
    PENDING: "Em análise",
    APPROVED: "Aprovada",
    REJECTED: "Rejeitada",
    CANCELLED: "Cancelada",
};

export const CLAIM_TYPE_LABEL: Record<EstablishmentType, string> = {
    RESTAURANT: "Restaurante",
    HOST_POINT: "Hospedagem",
};

export function claimSpotPath(spotId: string, type: EstablishmentType): string {
    return establishmentPath({ id: spotId, apiType: type === "RESTAURANT" ? "restaurant" : "hostpoint" });
}

export function formatClaimDate(iso?: string | null, withTime = false): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return withTime
        ? date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
        : date.toLocaleDateString("pt-BR");
}

/** Mensagem do backend quando é uma recusa de regra (4xx); 422 junta os erros de campo. */
export function claimErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) return fallback;
    if (!error.response) return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
    const { status, data } = error.response;
    if (status === 422 && Array.isArray(data?.errors)) {
        const messages = (data.errors as { message?: string }[]).map((e) => e.message).filter(Boolean);
        if (messages.length) return messages.join(" ");
    }
    if ([400, 404, 409, 422, 429].includes(status) && typeof data?.message === "string" && data.message.trim()) {
        return data.message.trim();
    }
    return fallback;
}
