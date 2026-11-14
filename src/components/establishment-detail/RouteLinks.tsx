import Icon from "../ui/Icon";
import type { RouteLink } from "../../utils/directions";
import "./establishment-detail.css";

export default function RouteLinks({ links, tall = false }: { links: RouteLink[]; tall?: boolean }) {
    return (
        <ul className={`estd-routes${tall ? " estd-routes--tall" : ""}`}>
            {links.map((link) => (
                <li key={link.id}>
                    <a className="estd-route" href={link.href} target="_blank" rel="noopener noreferrer">
                        <span className="estd-route__mark" style={{ background: link.color }} aria-hidden="true">
                            {link.mark}
                        </span>
                        <span className="estd-route__name">
                            {link.name}
                            <span className="ui-sr-only"> (abre em nova aba)</span>
                        </span>
                        <Icon name="arrow_outward" />
                    </a>
                </li>
            ))}
        </ul>
    );
}
