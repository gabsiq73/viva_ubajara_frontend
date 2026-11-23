import type { CSSProperties } from "react";
import "./torn-divider.css";

type TornDividerProps = {
    fill: string;
    edge: "top" | "bottom";
};

export default function TornDivider({ fill, edge }: TornDividerProps) {
    return (
        <div
            className={`torn-divider torn-divider--${edge}`}
            style={{ "--torn-fill": fill } as CSSProperties}
            aria-hidden="true"
        />
    );
}
