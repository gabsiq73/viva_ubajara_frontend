import type { ReactNode } from "react";
import Icon from "../ui/Icon";
import { Skeleton } from "../ui/Skeleton";
import type { TourGuideResponse } from "../../admin/types";
import { useBrokenImage } from "../../hooks/useBrokenImage";
import "./style/Guides.css";

interface GuidesShowcaseProps {
    guides: TourGuideResponse[];
    loading: boolean;
    /** Conteúdo exibido no lugar da lista quando há erro ou nenhum guia. */
    fallback?: ReactNode;
}

function GuideCard({ guide }: { guide: TourGuideResponse }) {
    const photo = guide.photos?.[0]?.url;
    const image = useBrokenImage(photo);
    const languages = guide.languages?.filter(Boolean) ?? [];
    const phone = guide.phone?.replace(/[^\d+]/g, "");
    return (
        <article className="guide-card">
            <div className="guide-card__photo">
                {image.show ? (
                    <img src={photo} alt={guide.name} width={640} height={800} loading="lazy" decoding="async" onError={image.onError} />
                ) : (
                    <div className="guide-card__placeholder" aria-hidden="true">
                        <Icon name="person" />
                    </div>
                )}
                {languages.length > 0 && (
                    <ul className="guide-card__langs" aria-label="Idiomas">
                        {languages.map((lang) => (
                            <li key={lang}>
                                <Icon name="language" />
                                {lang}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="guide-card__body">
                <h3 className="guide-card__name" title={guide.name}>{guide.name}</h3>
                <span className="guide-card__role">
                    <Icon name="verified" />
                    Guia credenciado
                </span>
                {guide.description && <p className="guide-card__desc">{guide.description}</p>}
                {phone && (
                    <a href={`tel:${phone}`} className="guide-card__foot" aria-label={`Ligar para ${guide.name}`}>
                        <span>Falar com o guia</span>
                        <span className="guide-card__go" aria-hidden="true">
                            <Icon name="call" />
                        </span>
                    </a>
                )}
            </div>
        </article>
    );
}

function GuideSkeleton() {
    return (
        <li className="guide-card guide-card--skeleton" aria-hidden="true">
            <Skeleton className="guide-card__skeleton-photo" radius={0} />
            <div className="guide-card__body">
                <Skeleton width="65%" height={22} />
                <Skeleton width="40%" height={12} />
                <Skeleton width="100%" height={13} />
                <Skeleton width="80%" height={13} />
            </div>
        </li>
    );
}

export default function GuidesShowcase({ guides, loading, fallback }: GuidesShowcaseProps) {
    if (loading) {
        return (
            <ul className="guides-grid" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => <GuideSkeleton key={i} />)}
            </ul>
        );
    }
    if (guides.length === 0) return <>{fallback}</>;
    return (
        <ul className="guides-grid grid-reveal">
            {guides.map((guide) => (
                <li key={guide.id}>
                    <GuideCard guide={guide} />
                </li>
            ))}
        </ul>
    );
}
