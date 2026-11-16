export const RATING_LABELS: Record<number, string> = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente!",
};

export const averageFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function reviewsLabel(count: number): string {
  return `${count} ${count === 1 ? "avaliação" : "avaliações"}`;
}

export function formatRating(value: number): string {
  return averageFormat.format(value);
}

export interface EffectiveRating {
  rating: number | null;
  reviewCount: number;
}

/** Com avaliações reais usa a média e a contagem; sem elas cai no `starRating` legado, sem contagem. */
export function effectiveRating(
  starRating: number | null | undefined,
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined,
): EffectiveRating {
  const count = reviewCount ?? 0;
  if (count >= 1 && averageRating != null && averageRating > 0) return { rating: averageRating, reviewCount: count };
  return { rating: starRating && starRating > 0 ? starRating : null, reviewCount: 0 };
}
