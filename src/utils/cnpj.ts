const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Mantém só letras/dígitos em caixa alta; as 12 primeiras posições aceitam letras (CNPJ alfanumérico) e as 2 últimas são dígitos verificadores. */
export function cnpjRaw(value: string): string {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return cleaned.slice(0, 12) + cleaned.slice(12).replace(/\D/g, "").slice(0, 2);
}

export function formatCnpj(value: string): string {
    const raw = cnpjRaw(value);
    const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 8), raw.slice(8, 12), raw.slice(12, 14)];
    let out = parts[0];
    if (parts[1]) out += `.${parts[1]}`;
    if (parts[2]) out += `.${parts[2]}`;
    if (parts[3]) out += `/${parts[3]}`;
    if (parts[4]) out += `-${parts[4]}`;
    return out;
}

function checkDigit(base: string, weights: number[]): number {
    const sum = weights.reduce((total, weight, index) => total + (base.charCodeAt(index) - 48) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
}

/** Mesma regra do backend (CnpjValidator): valor do caractere = código - 48, sequência repetida é inválida. */
export function validateCnpj(value: string): string | undefined {
    const raw = cnpjRaw(value);
    if (!raw) return "Informe o CNPJ da empresa.";
    if (raw.length < 14) return "O CNPJ precisa ter 14 caracteres. Confira se não falta nenhum.";
    const valid =
        new Set(raw).size > 1 &&
        checkDigit(raw.slice(0, 12), FIRST_WEIGHTS) === Number(raw[12]) &&
        checkDigit(raw.slice(0, 13), SECOND_WEIGHTS) === Number(raw[13]);
    return valid ? undefined : "CNPJ inválido. Confira os números digitados.";
}
