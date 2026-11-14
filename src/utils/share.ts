import { copyText } from "./clipboard";

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

export async function shareLink(data: { title: string; text?: string; url: string }): Promise<ShareOutcome> {
    if (typeof navigator.share === "function") {
        try {
            await navigator.share(data);
            return "shared";
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
        }
    }
    return (await copyText(data.url)) ? "copied" : "failed";
}
