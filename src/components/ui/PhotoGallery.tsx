import type { MouseEvent } from "react";
import type { DetailPhoto } from "../../utils/establishmentDetail";
import { useBrokenImage } from "../../hooks/useBrokenImage";
import "./photo-gallery.css";

const MAX_TILES = 6;

interface PhotoGalleryProps {
    title: string;
    photos: DetailPhoto[];
    onOpen: (index: number, event: MouseEvent<HTMLButtonElement>) => void;
}

function Thumb({ url }: { url: string }) {
    const image = useBrokenImage(url);
    return image.show ? <img src={url} alt="" width={800} height={600} loading="lazy" decoding="async" onError={image.onError} /> : null;
}

export default function PhotoGallery({ title, photos, onOpen }: PhotoGalleryProps) {
    const total = photos.length;
    const tiles = photos.slice(0, MAX_TILES);
    const hidden = total - tiles.length;

    return (
        <ul className="ui-photo-gallery" data-count={tiles.length} aria-label={`Fotos de ${title}`}>
            {tiles.map((photo, i) => {
                const isLast = i === tiles.length - 1;
                const more = isLast && hidden > 0 ? hidden : 0;
                const label = `Ampliar foto ${i + 1} de ${total}: ${photo.alt}${more ? ` (e mais ${more} ${more === 1 ? "foto" : "fotos"})` : ""}`;
                return (
                    <li key={photo.url} className="ui-photo-gallery__cell">
                        <button type="button" className="ui-photo-gallery__item" aria-label={label} onClick={(event) => onOpen(i, event)}>
                            <Thumb url={photo.url} />
                            {more > 0 && <span className="ui-photo-gallery__more" aria-hidden="true">+{more}</span>}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
