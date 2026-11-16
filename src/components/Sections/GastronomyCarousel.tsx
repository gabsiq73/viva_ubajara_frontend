import { useId, type KeyboardEvent } from "react";
import "./style/GastronomyCarousel.css";

export type GastronomySlide = {
  tag: string;
  src: string;
  alt: string;
};

type Props = {
  slides: GastronomySlide[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
};

export function GastronomyCarousel({ slides, activeIndex, onActiveChange }: Props) {
  const uid = useId();
  const n = slides.length;
  const index = n > 0 ? Math.min(Math.max(0, activeIndex), n - 1) : 0;
  const tabId = (i: number) => `${uid}-tab-${i}`;
  const panelId = (i: number) => `${uid}-panel-${i}`;

  if (n === 0) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % n
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index - 1 + n) % n
      : event.key === "Home" ? 0
      : event.key === "End" ? n - 1
      : null;
    if (next === null) return;
    event.preventDefault();
    onActiveChange(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="gastro-carousel">
      <div className="gastro-viewport">
        {slides.map((slide, i) => (
          <div
            key={slide.tag}
            id={panelId(i)}
            role={n > 1 ? "tabpanel" : undefined}
            aria-labelledby={n > 1 ? tabId(i) : undefined}
            className={`gastro-slide${i === index ? " is-active" : ""}`}
            aria-hidden={i !== index}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="gastro-slide-img"
              width={800}
              height={600}
              decoding="async"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {n > 1 && (
          <div className="gastro-dots" role="tablist" aria-label="Slides da gastronomia" onKeyDown={handleKeyDown}>
            {slides.map((slide, i) => (
              <button
                key={slide.tag}
                id={tabId(i)}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={panelId(i)}
                aria-label={slide.tag}
                tabIndex={i === index ? 0 : -1}
                className={i === index ? "is-active" : ""}
                onClick={() => onActiveChange(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
