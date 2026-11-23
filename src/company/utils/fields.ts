const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INSTAGRAM_HANDLE_RE = /^@?[A-Za-z0-9._]{1,30}$/;

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Aceita "+55 88 99999-9999" colado; o código do país é descartado. */
export function phoneDigits(raw: string): string {
  let digits = onlyDigits(raw);
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  return digits.slice(0, 11);
}

export function formatPhone(raw: string): string {
  const digits = phoneDigits(raw);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Máscara que permite apagar a pontuação com Backspace sem travar no último dígito. */
export function maskPhoneInput(next: string, previous: string): string {
  const digits = phoneDigits(next);
  const deletedLiteral = next.length < previous.length && digits === phoneDigits(previous);
  return formatPhone(deletedLiteral ? digits.slice(0, -1) : digits);
}

export const validatePhone = (value: string): string | undefined => {
  if (!value.trim()) return undefined;
  const length = phoneDigits(value).length;
  return length === 10 || length === 11 ? undefined : 'Informe o telefone com DDD, por exemplo (88) 99999-9999.';
};

export const validateEmail = (value: string): string | undefined =>
  !value.trim() || EMAIL_RE.test(value.trim()) ? undefined : 'Informe um e-mail válido, por exemplo contato@empresa.com.br.';

/** Acrescenta https:// quando a pessoa digita só "www.site.com.br". */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return /^[^\s/]+\.[^\s/]{2,}/.test(trimmed) ? `https://${trimmed}` : trimmed;
}

export const validateUrl = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')) return undefined;
  } catch {
    // cai na mensagem abaixo
  }
  return 'Informe um link completo, como https://www.seusite.com.br.';
};

/** "@perfil" ou "perfil" viram o link do Instagram, que é o que o site público abre. */
export function normalizeInstagram(value: string): string {
  const trimmed = value.trim();
  if (INSTAGRAM_HANDLE_RE.test(trimmed) && (trimmed.startsWith('@') || !trimmed.includes('.'))) {
    return `https://www.instagram.com/${trimmed.replace(/^@/, '')}/`;
  }
  return normalizeUrl(trimmed);
}

export const validateInstagram = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /instagram\.com/i.test(trimmed) && !validateUrl(trimmed)
    ? undefined
    : 'Informe o perfil (@seuperfil) ou o link do Instagram.';
};

/** "65" ou "65,5" viram "R$ 65,00" / "R$ 65,50"; textos livres ("R$ 65 por pessoa") ficam como estão. */
export function normalizePrice(value: string): string {
  const trimmed = value.trim();
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) return trimmed;
  const [integer, cents = ''] = trimmed.replace(',', '.').split('.');
  return `R$ ${integer},${cents.padEnd(2, '0')}`;
}

export const validatePrice = (value: string): string | undefined =>
  !value.trim() || /\d/.test(value) ? undefined : 'Informe um valor, por exemplo R$ 65,00 por pessoa.';

export const formatFileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
