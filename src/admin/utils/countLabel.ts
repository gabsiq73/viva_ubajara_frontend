const countFormat = new Intl.NumberFormat('pt-BR');

export function countLabel(count: number, singular: string, plural: string) {
  return `${countFormat.format(count)} ${count === 1 ? singular : plural}`;
}
