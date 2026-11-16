import Icon from "../ui/Icon";
import "./establishment-detail.css";

export interface SectionAnchor {
    id: string;
    label: string;
}

interface SectionBarProps {
    anchors: SectionAnchor[];
    activeId: string | undefined;
    onNavigate: (id: string) => void;
    favorite: boolean;
    onToggleFavorite: () => void;
    onShare: () => void;
}

export default function SectionBar({ anchors, activeId, onNavigate, favorite, onToggleFavorite, onShare }: SectionBarProps) {
    return (
        <div className="estd-bar">
            <div className="ui-container estd-bar__inner">
                <nav className="estd-bar__nav" aria-label="Seções da página">
                    {anchors.map((anchor) => (
                        <a
                            key={anchor.id}
                            href={`#${anchor.id}`}
                            className={`estd-bar__link${activeId === anchor.id ? " estd-bar__link--on" : ""}`}
                            data-label={anchor.label}
                            aria-current={activeId === anchor.id ? "location" : undefined}
                            onClick={(event) => {
                                event.preventDefault();
                                onNavigate(anchor.id);
                            }}
                        >
                            {anchor.label}
                        </a>
                    ))}
                </nav>
                <div className="estd-bar__actions">
                    <button
                        type="button"
                        className={`estd-bar__btn${favorite ? " estd-bar__btn--saved" : ""}`}
                        aria-pressed={favorite}
                        onClick={onToggleFavorite}
                    >
                        <Icon name="favorite" filled={favorite} />
                        {favorite ? "Salvo" : "Salvar"}
                    </button>
                    <button type="button" className="estd-bar__btn" onClick={onShare}>
                        <Icon name="ios_share" />
                        Compartilhar
                    </button>
                </div>
            </div>
        </div>
    );
}
