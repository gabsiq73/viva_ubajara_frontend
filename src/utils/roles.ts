export const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrador",
    USER: "Usuário",
    GUIDE: "Guia Turístico",
    EMPRESA: "Empresa",
};

export function getRoleLabel(role?: string | null): string {
    if (!role) return "";
    return ROLE_LABELS[role] ?? role;
}
