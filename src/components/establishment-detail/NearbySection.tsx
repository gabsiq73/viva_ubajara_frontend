import EstablishmentCard from "../ui/EstablishmentCard";
import Icon from "../ui/Icon";
import { EstablishmentCardSkeleton } from "../ui/Skeleton";
import { Link } from "react-router-dom";
import type { Establishment } from "../../utils/establishments";
import "./establishment-detail.css";

interface NearbySectionProps {
    loading: boolean;
    items: Establishment[];
    lodging: boolean;
    favoriteIds: Set<string>;
    onToggleFavorite: (item: Establishment) => void;
}

export default function NearbySection({ loading, items, lodging, favoriteIds, onToggleFavorite }: NearbySectionProps) {
    return (
        <section id="perto-daqui" className="estd-nearby" aria-labelledby="estd-nearby-title">
            <div className="ui-container estd-nearby__inner">
                <div className="estd-nearby__head">
                    <div className="estd-nearby__heading">
                        <span className="estd-eyebrow">Perto daqui</span>
                        <h2 id="estd-nearby-title" className="estd-h2 estd-h2--lg">
                            {lodging ? "Outras hospedagens em Ubajara" : "Outros restaurantes em Ubajara"}
                        </h2>
                    </div>
                    <Link to="/estabelecimentos" className="estd-nearby__all">
                        Ver todos
                        <Icon name="arrow_forward" />
                    </Link>
                </div>
                {loading ? (
                    <div key="skeleton" className="estd-nearby__grid" aria-hidden="true">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="estd-nearby__cell">
                                <EstablishmentCardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div key="items" className="estd-nearby__grid estd-nearby__grid--in">
                        {items.map((item) => (
                            <div key={`${item.apiType}-${item.id}`} className="estd-nearby__cell">
                                <EstablishmentCard
                                    item={item}
                                    favorite={favoriteIds.has(item.id)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
