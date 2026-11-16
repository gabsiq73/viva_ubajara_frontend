const BACKEND_DATE = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function fromParts(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date | null {
    const date = new Date(year, month - 1, day, hour, minute, second);
    const valid =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date.getHours() === hour &&
        date.getMinutes() === minute;
    return valid ? date : null;
}

/** Lê `dd/MM/yyyy HH:mm:ss` (formato das datas de evento da API); devolve null se vazio ou inválido. */
export function parseBackendDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    const match = BACKEND_DATE.exec(raw.trim());
    if (!match) return null;
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
    return fromParts(+year, +month, +day, +hour, +minute, +second);
}

/**
 * Lê datas ISO da API. Data pura (`yyyy-MM-dd`) vira meia-noite local, porque
 * `new Date("yyyy-MM-dd")` é UTC e mostraria o dia anterior no Brasil.
 */
export function parseIsoDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    const dateOnly = ISO_DATE_ONLY.exec(raw);
    if (dateOnly) return fromParts(+dateOnly[1], +dateOnly[2], +dateOnly[3]);
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

const LOCALE = "pt-BR";
const dayFormat = new Intl.DateTimeFormat(LOCALE, { day: "2-digit" });
const monthShortFormat = new Intl.DateTimeFormat(LOCALE, { month: "short" });
const monthLongFormat = new Intl.DateTimeFormat(LOCALE, { month: "long" });
const yearFormat = new Intl.DateTimeFormat(LOCALE, { year: "numeric" });
const longDateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric" });
const mediumDateFormat = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export const formatDay = (date: Date) => dayFormat.format(date);
export const formatMonthShort = (date: Date) => capitalize(monthShortFormat.format(date).replace(/\.$/, ""));
export const formatMonthLong = (date: Date) => capitalize(monthLongFormat.format(date));
export const formatYear = (date: Date) => yearFormat.format(date);
export const formatLongDate = (date: Date) => longDateFormat.format(date);
export const formatMediumDate = (date: Date) => mediumDateFormat.format(date);
export const formatTime = (date: Date) => timeFormat.format(date);

/** `yyyy-MM-dd`, para o atributo `dateTime` de `<time>` e chaves de mês (`yyyy-MM`). */
export function toIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export function toMonthKey(date: Date): string {
    return toIsoDate(date).slice(0, 7);
}
