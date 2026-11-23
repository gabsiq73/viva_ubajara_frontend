import { Link } from "react-router-dom";
import Icon from "./Icon";

interface Crumb {
    label: string;
    to?: string;
}

interface PageHeroProps {
    image?: string | null;
    breadcrumb?: Crumb[];
    eyebrow?: string;
    title: string;
    accent?: string;
    description?: string;
}

/** Hero de página interna: foto com gradiente ou, sem foto, verde-floresta com anéis dourados. */
export default function PageHero({ image, breadcrumb, eyebrow, title, accent, description }: PageHeroProps) {
    return (
        <section className={`ui-hero${image ? " ui-hero--photo" : " ui-hero--plain"}`}>
            {image ? (
                <>
                    <img
                        src={image}
                        alt=""
                        className="ui-hero__img"
                        width={1600}
                        height={900}
                        fetchPriority="high"
                        decoding="async"
                    />
                    <div className="ui-hero__shade" />
                </>
            ) : (
                <>
                    <span className="ui-hero__ring ui-hero__ring--outer" aria-hidden="true" />
                    <span className="ui-hero__ring ui-hero__ring--inner" aria-hidden="true" />
                </>
            )}
            <div className="ui-container">
                <div className="ui-hero__content">
                    {breadcrumb && breadcrumb.length > 0 && (
                        <nav className="ui-hero__crumbs" aria-label="Você está em">
                            {breadcrumb.map((crumb, index) => (
                                <span key={crumb.label} className="ui-hero__crumb">
                                    {index > 0 && <Icon name="chevron_right" />}
                                    {crumb.to ? (
                                        <Link to={crumb.to}>{crumb.label}</Link>
                                    ) : (
                                        <span aria-current="page">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}
                    {eyebrow && <span className="ui-hero__eyebrow">{eyebrow}</span>}
                    <h1 className="ui-hero__title">
                        {title}
                        {accent && (
                            <>
                                {" "}
                                <em className="ui-hero__accent">{accent}</em>
                            </>
                        )}
                    </h1>
                    {description && <p className="ui-hero__desc">{description}</p>}
                </div>
            </div>
        </section>
    );
}
