import { Link } from "react-router-dom";
import Badge from "./Badge";
import Icon from "./Icon";
import type { AttractionResponse } from "../../admin/types";
import { formatRating, reviewsLabel } from "../../utils/rating";
import { ATTRACTION_CATEGORY_ICONS, ATTRACTION_CATEGORY_LABELS } from "../../utils/attractionCategories";


export default function PointCard({ item }: { item: AttractionResponse }) {
    const photo = item.photos?.[0]?.url;
    const reviewCount = item.reviewCount ?? 0;
    const hasRating = reviewCount > 0 && item.averageRating != null;
    return (
        <article className="ui-point">
            <div className="ui-point__media">
                {photo ? (
                    <img src={photo} alt="" className="ui-point__img" width={400} height={480} loading="lazy" decoding="async" />
                ) : (
                    <div className="ui-point__placeholder" aria-hidden="true">
                        <Icon name={ATTRACTION_CATEGORY_ICONS[item.category] ?? "landscape"} />
                    </div>
                )}
                <div className="ui-point__shade" />
            </div>
            <Badge variant="tag" className="ui-point__tag">
                {ATTRACTION_CATEGORY_LABELS[item.category] ?? item.category}
            </Badge>
            <div className="ui-point__body">
                <h3 className="ui-point__title">
                    <Link to={`/pontos/${item.id}`} className="ui-point__link">
                        {item.name}
                    </Link>
                </h3>
                <p className="ui-point__desc">{item.shortDescription ?? item.description}</p>
                <div className="ui-point__foot">
                    {(item.averageVisitDuration != null || hasRating) && (
                        <div className="ui-point__chips">
                            {hasRating && (
                                <span
                                    className="ui-point__chip ui-point__chip--rating"
                                    role="img"
                                    aria-label={`Nota ${formatRating(item.averageRating!)} de 5, ${reviewsLabel(reviewCount)}`}
                                >
                                    <Icon name="star" filled />
                                    {formatRating(item.averageRating!)}&nbsp;({reviewCount})
                                </span>
                            )}
                            {item.averageVisitDuration != null && (
                                <span className="ui-point__chip">
                                    <Icon name="schedule" />
                                    {item.averageVisitDuration}&nbsp;min
                                </span>
                            )}
                        </div>
                    )}
                    <span className="ui-point__cta" aria-hidden="true">
                        Saiba mais
                        <Icon name="arrow_forward" />
                    </span>
                </div>
            </div>
        </article>
    );
}
