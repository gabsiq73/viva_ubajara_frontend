import type { CSSProperties } from "react";

interface SkeletonProps {
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    radius?: CSSProperties["borderRadius"];
    className?: string;
}

export function Skeleton({ width, height, radius, className = "" }: SkeletonProps) {
    return (
        <span
            className={`ui-skeleton ${className}`.trim()}
            style={{ width, height, borderRadius: radius }}
            aria-hidden="true"
        />
    );
}

export function PointCardSkeleton() {
    return (
        <div className="ui-point ui-point--skeleton" aria-hidden="true">
            <div className="ui-point__body">
                <Skeleton className="ui-point__skeleton-bar" width="70%" height={22} />
                <Skeleton className="ui-point__skeleton-bar" width="100%" height={13} />
                <Skeleton className="ui-point__skeleton-bar" width="55%" height={13} />
                <Skeleton className="ui-point__skeleton-bar" width="40%" height={26} radius={50} />
            </div>
        </div>
    );
}

export function EstablishmentCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
    if (view === "list") {
        return (
            <div className="ui-card ui-card--list ui-card--skeleton" aria-hidden="true">
                <Skeleton className="ui-card__skeleton-media" radius={0} />
                <div className="ui-card__main">
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="55%" height={22} />
                    <Skeleton width="90%" height={14} />
                    <Skeleton width="40%" height={14} />
                </div>
                <div className="ui-card__aside">
                    <Skeleton width={44} height={44} radius="50%" />
                    <Skeleton width={90} height={18} />
                    <Skeleton width={120} height={40} radius={50} />
                </div>
            </div>
        );
    }
    return (
        <div className="ui-card ui-card--skeleton" aria-hidden="true">
            <div className="ui-card__media">
                <Skeleton className="ui-card__skeleton-media" radius={0} />
            </div>
            <div className="ui-card__body">
                <Skeleton width="65%" height={21} />
                <Skeleton width="45%" height={13} />
                <Skeleton width="30%" height={14} className="ui-card__skeleton-price" />
            </div>
        </div>
    );
}
