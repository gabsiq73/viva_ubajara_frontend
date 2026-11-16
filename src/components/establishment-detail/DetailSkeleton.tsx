import { EstablishmentCardSkeleton, Skeleton } from "../ui/Skeleton";
import "./establishment-detail.css";

export default function DetailSkeleton() {
    return (
        <div aria-busy="true">
            <p className="ui-sr-only" role="status">
                Carregando estabelecimento
            </p>
            <div className="estd-hero estd-hero--plain estd-skel" aria-hidden="true">
                <div className="ui-container estd-hero__container">
                    <div className="estd-hero__content">
                        <Skeleton className="estd-skel__dark" width={260} height={14} />
                        <Skeleton className="estd-skel__dark" width={180} height={12} />
                        <Skeleton className="estd-skel__dark estd-skel__title" width="min(560px, 80%)" />
                        <div className="estd-hero__pills">
                            <Skeleton className="estd-skel__dark" width={110} height={32} radius={50} />
                            <Skeleton className="estd-skel__dark" width={140} height={32} radius={50} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="estd-bar estd-skel__bar" aria-hidden="true">
                <div className="ui-container estd-bar__inner">
                    <div className="estd-skel__row">
                        <Skeleton width={56} height={16} />
                        <Skeleton width={96} height={16} />
                        <Skeleton width={90} height={16} />
                    </div>
                    <div className="estd-skel__row estd-skel__bar-actions">
                        <Skeleton width={100} height={44} radius={50} />
                        <Skeleton width={150} height={44} radius={50} />
                    </div>
                </div>
            </div>
            <div className="estd-content" aria-hidden="true">
                <div className="ui-container estd-layout">
                    <div className="estd-main">
                        <div className="estd-skel__stack">
                            <Skeleton width={110} height={14} />
                            <Skeleton width="92%" height={26} />
                            <Skeleton width="78%" height={26} />
                            <Skeleton height={76} radius={16} />
                        </div>
                        <div className="estd-skel__stack">
                            <Skeleton width={200} height={30} />
                            <Skeleton height={300} radius={20} />
                        </div>
                    </div>
                    <div className="estd-skel__aside">
                        <Skeleton height={340} radius={20} />
                    </div>
                </div>
            </div>
            <div className="estd-nearby estd-skel__nearby" aria-hidden="true">
                <div className="ui-container estd-nearby__inner">
                    <Skeleton width={280} height={32} />
                    <div className="estd-nearby__grid">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="estd-nearby__cell">
                                <EstablishmentCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
