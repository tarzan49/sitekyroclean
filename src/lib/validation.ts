import { z } from "zod";

// Portuguese phone regex: +351, 00351, or local format (9 digits)
const phoneRegex = /^(\+351|00351)?[0-9]{9}$/;

// Maximum field lengths to prevent abuse
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // RFC 5321
const MAX_PHONE_LENGTH = 20;
const MAX_LOCATION_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

// Maximum file size: 5MB per file
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum total files size: 9MB (leaving room for Resend 10MB limit with base64 overhead)
export const MAX_TOTAL_FILES_SIZE = 9 * 1024 * 1024;

// Allowed image MIME types
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Quote form validation schema
export const quoteFormSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(MAX_NAME_LENGTH, `Nome não pode ter mais de ${MAX_NAME_LENGTH} caracteres`)
    .trim()
    .refine((val) => val.length > 0, "Nome não pode estar vazio"),

  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(MAX_EMAIL_LENGTH, `Email não pode ter mais de ${MAX_EMAIL_LENGTH} caracteres`)
    .email("Email inválido")
    .trim()
    .toLowerCase(),

  telefone: z
    .string()
    .max(MAX_PHONE_LENGTH, `Telefone não pode ter mais de ${MAX_PHONE_LENGTH} caracteres`)
    .trim()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || phoneRegex.test(val.replace(/\s/g, "")),
      "Telefone inválido. Use formato português (9 dígitos)"
    ),

  localidade: z
    .string()
    .max(MAX_LOCATION_LENGTH, `Localidade não pode ter mais de ${MAX_LOCATION_LENGTH} caracteres`)
    .trim()
    .optional(),

  mensagem: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(MAX_MESSAGE_LENGTH, `Mensagem não pode ter mais de ${MAX_MESSAGE_LENGTH} caracteres`)
    .trim()
    .refine((val) => val.length > 0, "Mensagem não pode estar vazia"),

  files: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(), // base64
        type: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// File validation helper
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de ficheiro não permitido: ${file.type}. Apenas imagens são aceites.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Ficheiro muito grande: ${file.name}. Máximo ${maxSizeMB}MB por ficheiro.`,
    };
  }

  return { valid: true };
};

// Validate total files size
export const validateTotalFilesSize = (files: File[]): { valid: boolean; error?: string } => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > MAX_TOTAL_FILES_SIZE) {
    const maxTotalMB = MAX_TOTAL_FILES_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Tamanho total dos ficheiros excede ${maxTotalMB}MB`,
    };
  }

  return { valid: true };
};

// Newsletter subscription validation schema
export const newsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(MAX_EMAIL_LENGTH, `Email não pode ter mais de ${MAX_EMAIL_LENGTH} caracteres`)
    .email("Email inválido")
    .trim()
    .toLowerCase(),

  name: z
    .string()
    .max(MAX_NAME_LENGTH, `Nome não pode ter mais de ${MAX_NAME_LENGTH} caracteres`)
    .trim()
    .optional(),

  groupId: z.string().optional(),

  customFields: z.record(z.union([z.string(), z.number()])).optional(),
});

export type NewsletterSubscriptionData = z.infer<typeof newsletterSubscriptionSchema>;
