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
  const n = slides.length;
  const index = n > 0 ? Math.min(Math.max(0, activeIndex), n - 1) : 0;

  if (n === 0) return null;

  return (
    <div className="gastro-carousel">
      <div className="gastro-viewport">
        <div
          className="gastro-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.tag}
              className={`gastro-slide ${i === index ? "is-active" : ""}`}
              aria-hidden={i !== index}
            >
              <div className="gastro-slide-frame">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="gastro-slide-img"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="gastro-dots" role="tablist" aria-label="Slides da gastronomia">
          {slides.map((slide, i) => (
            <button
              key={slide.tag}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.tag}
              className={i === index ? "is-active" : ""}
              onClick={() => onActiveChange(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
