import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import FavoriteButton from "../ui/FavoriteButton";
import Icon from "../ui/Icon";
import { FilterChip } from "../ui/Chip";
import { Skeleton } from "../ui/Skeleton";
import type { AttractionCategory, AttractionResponse } from "../../admin/types";
import { useBrokenImage } from "../../hooks/useBrokenImage";
import { formatCount } from "../../utils/rating";
import {
    ATTRACTION_CATEGORY_ICONS,
    ATTRACTION_CATEGORY_LABELS,
    ATTRACTION_CATEGORY_PLURALS,
} from "../../utils/attractionCategories";
import "./style/PointsShowcase.css";

const ALL = "ALL";

interface PointsShowcaseProps {
    items: AttractionResponse[];
    loading: boolean;
    /** Conteúdo exibido no lugar da lista quando há erro ou nenhum item. */
    fallback?: ReactNode;
    favoriteIds: Set<string>;
    onToggleFavorite: (item: AttractionResponse) => void;
    moreTo: string;
    moreLabel: string;
}

function visitInfo(item: AttractionResponse): string[] {
    const parts: string[] = [];
    if (item.hasGuide) parts.push("Guiado");
    else if (item.freeAccess) parts.push("Acesso livre");
    else if (item.entryPrice?.trim()) parts.push(item.entryPrice.trim());
    return parts;
}

function PointShowcaseCard({
    item,
    favorite,
    onToggleFavorite,
}: {
    item: AttractionResponse;
    favorite: boolean;
    onToggleFavorite: (item: AttractionResponse) => void;
}) {
    const photo = item.photos?.[0]?.url;
    const image = useBrokenImage(photo);
    const info = visitInfo(item);
    const hasDuration = !!item.averageVisitDuration;
    return (
        <article className="pts-card">
            <div className="pts-card__media">
                {image.show ? (
                    <img
                        src={photo}
                        alt=""
                        className="pts-card__img"
                        width={400}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        onError={image.onError}
                    />
                ) : (
                    <div className="pts-card__placeholder" aria-hidden="true">
                        <Icon name={ATTRACTION_CATEGORY_ICONS[item.category] ?? "landscape"} />
                    </div>
                )}
                <Badge variant="tag" className="pts-card__tag">
                    {ATTRACTION_CATEGORY_LABELS[item.category] ?? item.category}
                </Badge>
                <FavoriteButton active={favorite} onToggle={() => onToggleFavorite(item)} className="pts-card__fav" />
            </div>
            <div className="pts-card__body">
                {(hasDuration || info.length > 0) && (
                    <p className="pts-card__meta">
                        {hasDuration && (
                            <span className="pts-card__meta-item">
                                <Icon name="schedule" />
                                {formatCount(item.averageVisitDuration!)}&nbsp;min
                            </span>
                        )}
                        {info.map((text) => (
                            <span key={text} className="pts-card__meta-item">{text}</span>
                        ))}
                    </p>
                )}
                <h3 className="pts-card__title">
                    <Link to={`/pontos/${item.id}`} className="pts-card__link" title={item.name}>
                        {item.name}
                    </Link>
                </h3>
                <p className="pts-card__desc">{item.shortDescription || item.description}</p>
                <span className="pts-card__cta" aria-hidden="true">
                    Saiba mais
                    <Icon name="arrow_forward" />
                </span>
            </div>
        </article>
    );
}

function PointShowcaseSkeleton() {
    return (
        <div className="pts-card pts-card--skeleton" aria-hidden="true">
            <Skeleton className="pts-card__skeleton-media" radius={16} />
            <div className="pts-card__body">
                <Skeleton width="45%" height={12} />
                <Skeleton width="80%" height={22} />
                <Skeleton width="100%" height={13} />
                <Skeleton width="60%" height={13} />
            </div>
        </div>
    );
}

export default function PointsShowcase({ items, loading, fallback, favoriteIds, onToggleFavorite, moreTo, moreLabel }: PointsShowcaseProps) {
    const [filter, setFilter] = useState<string>(ALL);

    const categories = useMemo(() => {
        const counts = new Map<AttractionCategory, number>();
        for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
        return [...counts.entries()];
    }, [items]);

    const activeFilter = filter === ALL || categories.some(([category]) => category === filter) ? filter : ALL;
    const visible = activeFilter === ALL ? items : items.filter((item) => item.category === activeFilter);

    if (loading) {
        return (
            <ul className="pts-grid" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => <li key={i}><PointShowcaseSkeleton /></li>)}
            </ul>
        );
    }

    if (items.length === 0) return <>{fallback}</>;

    return (
        <>
            {categories.length > 1 && (
                <div className="pts-filters" role="group" aria-label="Filtrar pontos turísticos por tipo">
                    <FilterChip label="Todos" count={items.length} selected={activeFilter === ALL} onClick={() => setFilter(ALL)} />
                    {categories.map(([category, count]) => (
                        <FilterChip
                            key={category}
                            label={ATTRACTION_CATEGORY_PLURALS[category] ?? category}
                            count={count}
                            selected={activeFilter === category}
                            onClick={() => setFilter(category)}
                        />
                    ))}
                </div>
            )}
            <ul className="pts-grid" key={activeFilter}>
                {visible.map((item) => (
                    <li key={item.id}>
                        <PointShowcaseCard item={item} favorite={favoriteIds.has(item.id)} onToggleFavorite={onToggleFavorite} />
                    </li>
                ))}
            </ul>
            <Link to={moreTo} className="sec-head__cta pts-more">
                {moreLabel}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
        </>
    );
}
