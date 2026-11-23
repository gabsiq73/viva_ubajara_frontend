import { Link } from "react-router-dom";
import { Skeleton } from "../ui/Skeleton";
import { useBrokenImage } from "../../hooks/useBrokenImage";
import "./style/Agenda.css";

interface AgendaItemProps {
    id: string;
    name: string;
    description: string;
    location: string;
    photo?: string;
    day: string;
    month: string;
    /** Data por extenso, lida só por leitores de tela. */
    longDate?: string;
}

export function AgendaItem({ id, name, description, location, photo, day, month, longDate }: AgendaItemProps) {
    const image = useBrokenImage(photo);
    return (
        <article className="agenda__item">
            <div className="agenda__date" aria-hidden="true">
                <strong className="agenda__day">{day}</strong>
                <span className="agenda__month">{month}</span>
            </div>
            <div className="agenda__media">
                {image.show ? (
                    <img src={photo} alt="" width={368} height={245} loading="lazy" decoding="async" onError={image.onError} />
                ) : (
                    <div className="agenda__placeholder" aria-hidden="true">
                        <span className="material-symbols-outlined">event</span>
                    </div>
                )}
            </div>
            <div className="agenda__body">
                <h3 className="agenda__title">
                    <Link to={`/eventos/${id}`} className="agenda__link" title={name}>
                        {name}
                        {longDate && <span className="ui-sr-only">, {longDate}</span>}
                    </Link>
                </h3>
                {description && <p className="agenda__desc">{description}</p>}
                {location && (
                    <div className="agenda__loc">
                        <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                        <span>{location}</span>
                    </div>
                )}
            </div>
            <span className="agenda__go" aria-hidden="true">
                <span className="material-symbols-outlined">arrow_forward</span>
            </span>
        </article>
    );
}

export function AgendaSkeleton() {
    return (
        <li>
            <article className="agenda__item agenda__item--skeleton" aria-hidden="true">
                <div className="agenda__date">
                    <Skeleton width={44} height={36} />
                    <Skeleton width={30} height={12} />
                </div>
                <div className="agenda__media">
                    <Skeleton className="agenda__skeleton-fill" radius={0} />
                </div>
                <div className="agenda__body">
                    <Skeleton width="75%" height={22} />
                    <Skeleton width="100%" height={13} />
                    <Skeleton width="45%" height={13} />
                </div>
                <Skeleton width={44} height={44} radius="50%" />
            </article>
        </li>
    );
}
