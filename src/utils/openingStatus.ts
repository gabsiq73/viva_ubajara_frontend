/** Pronto para quando o backend entregar horário estruturado; ainda não é usado pela tela. */
export interface DayHours {
    /** 0 = domingo … 6 = sábado */
    day: number;
    closed?: boolean;
    /** "HH:MM" */
    open?: string;
    /** "HH:MM"; menor que `open` indica que fecha após a meia-noite. */
    close?: string;
}

export type OpenState = "open" | "opens-later" | "closed";

export interface OpenStatus {
    state: OpenState;
    label: string;
    color: string;
}

const TIME_ZONE = "America/Fortaleza";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function formatTime(time: string): string {
    const [h, m] = time.split(":");
    return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function nowInFortaleza(now: Date): { day: number; minutes: number } {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return { day: WEEKDAYS.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function getOpenStatus(hours?: DayHours[], now: Date = new Date()): OpenStatus | null {
    if (!hours || hours.length === 0) return null;
    const { day, minutes } = nowInFortaleza(now);
    const today = hours.find((h) => h.day === day);
    const yesterday = hours.find((h) => h.day === (day + 6) % 7);

    if (yesterday && !yesterday.closed && yesterday.open && yesterday.close) {
        const overnight = toMinutes(yesterday.close) < toMinutes(yesterday.open);
        if (overnight && minutes < toMinutes(yesterday.close)) {
            return { state: "open", label: `Aberto agora · até ${formatTime(yesterday.close)}`, color: "#2d8a54" };
        }
    }

    if (!today || today.closed || !today.open || !today.close) {
        return { state: "closed", label: "Fechado hoje", color: "#4a5c51" };
    }

    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    const isOpen = close < open ? minutes >= open : minutes >= open && minutes < close;
    if (isOpen) {
        return { state: "open", label: `Aberto agora · até ${formatTime(today.close)}`, color: "#2d8a54" };
    }
    if (minutes < open) {
        return { state: "opens-later", label: `Abre às ${formatTime(today.open)}`, color: "#c58b24" };
    }
    return { state: "closed", label: "Fechado hoje", color: "#4a5c51" };
}
