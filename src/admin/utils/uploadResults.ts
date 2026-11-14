export function failedUploadsMessage(results: PromiseSettledResult<unknown>[]): string | null {
  const failed = results.filter((r) => r.status === 'rejected').length;
  return failed > 0
    ? `Registro criado, mas ${failed} foto(s) não foram enviadas. Reenvie pela edição.`
    : null;
}
