import { z } from "zod";

/**
 * Sanitiza una cadena de texto:
 * - Elimina espacios al inicio/fin
 * - Remueve caracteres de control invisibles
 * - Elimina etiquetas HTML/script (anti-XSS)
 * - Colapsa espacios múltiples
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input) return "";
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "") // caracteres de control
    .replace(/<\/?[^>]+(>|$)/g, "")        // etiquetas HTML
    .replace(/javascript:/gi, "")          // protocolos peligrosos
    .replace(/on\w+\s*=/gi, "")            // handlers inline (onclick, etc.)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Sanitiza email: lower-case, sin espacios, sin caracteres extraños. */
export function sanitizeEmail(input: string): string {
  return sanitizeText(input, 254).toLowerCase().replace(/\s/g, "");
}

/** Sanitiza teléfono: solo dígitos, +, espacios y guiones. */
export function sanitizePhone(input: string): string {
  return (input || "").replace(/[^\d+\-\s()]/g, "").trim().slice(0, 20);
}

// ===== Esquemas Zod reutilizables =====
export const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es requerido")
  .max(254, "Correo demasiado largo")
  .email("Correo electrónico inválido");

export const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(128, "Contraseña demasiado larga");

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre es muy corto")
  .max(100, "El nombre es demasiado largo")
  .regex(/^[\p{L}\s'.-]+$/u, "El nombre contiene caracteres no permitidos");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida").max(128),
});

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });