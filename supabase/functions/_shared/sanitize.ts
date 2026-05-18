/**
 * HTML escape utility to prevent XSS attacks in email templates
 * Escapes special HTML characters that could be used for injection
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - The text to escape
 * @returns Escaped text safe for HTML insertion
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text).replace(/[&<>"'\/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Validates email format using RFC 5322 simplified regex
 * @param email - Email to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number (Portuguese format)
 * @param phone - Phone to validate
 * @returns true if phone format is valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+351|00351)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Sanitizes and validates form data
 * @param data - Raw form data
 * @returns Sanitized data or throws error
 */
export interface FormData {
  nome: string;
  email: string;
  telefone?: string;
  localidade?: string;
  mensagem: string;
  files?: Array<{ name: string; content: string; type: string }>;
}

export interface SanitizedFormData {
  nome: string;
  email: string;
  telefone: string;
  localidade: string;
  mensagem: string;
  files: Array<{ name: string; content: string; type: string }>;
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
const MAX_LOCATION_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_NAME_LENGTH = 255;

export function sanitizeFormData(data: FormData): SanitizedFormData {
  // Validate required fields
  if (!data.nome || !data.email || !data.mensagem) {
    throw new Error("Campos obrigatórios em falta: nome, email, mensagem");
  }

  // Validate and sanitize nome
  const nome = String(data.nome).trim();
  if (nome.length === 0) {
    throw new Error("Nome não pode estar vazio");
  }
  if (nome.length > MAX_NAME_LENGTH) {
    throw new Error(`Nome não pode ter mais de ${MAX_NAME_LENGTH} caracteres`);
  }

  // Validate and sanitize email
  const email = String(data.email).trim().toLowerCase();
  if (email.length === 0) {
    throw new Error("Email não pode estar vazio");
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    throw new Error(`Email não pode ter mais de ${MAX_EMAIL_LENGTH} caracteres`);
  }
  if (!isValidEmail(email)) {
    throw new Error("Formato de email inválido");
  }

  // Validate and sanitize telefone
  const telefone = data.telefone ? String(data.telefone).trim() : "";
  if (telefone.length > MAX_PHONE_LENGTH) {
    throw new Error(`Telefone não pode ter mais de ${MAX_PHONE_LENGTH} caracteres`);
  }
  if (telefone && !isValidPhone(telefone)) {
    throw new Error("Formato de telefone inválido");
  }

  // Validate and sanitize localidade
  const localidade = data.localidade ? String(data.localidade).trim() : "";
  if (localidade.length > MAX_LOCATION_LENGTH) {
    throw new Error(`Localidade não pode ter mais de ${MAX_LOCATION_LENGTH} caracteres`);
  }

  // Validate and sanitize mensagem
  const mensagem = String(data.mensagem).trim();
  if (mensagem.length === 0) {
    throw new Error("Mensagem não pode estar vazia");
  }
  if (mensagem.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Mensagem não pode ter mais de ${MAX_MESSAGE_LENGTH} caracteres`);
  }

  // Validate files
  const files = data.files || [];
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const MAX_FILE_SIZE_BASE64 = 7 * 1024 * 1024; // ~5MB original becomes ~7MB in base64

  for (const file of files) {
    if (!file.name || !file.content || !file.type) {
      throw new Error("Ficheiro inválido: campos obrigatórios em falta");
    }

    // Validate file name length
    if (file.name.length > MAX_FILE_NAME_LENGTH) {
      throw new Error(`Nome de ficheiro muito longo: ${file.name}`);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Tipo de ficheiro não permitido: ${file.type}`);
    }

    // Validate base64 content size
    if (file.content.length > MAX_FILE_SIZE_BASE64) {
      throw new Error(`Ficheiro muito grande: ${file.name}`);
    }

    // Basic validation that content is base64
    if (!file.content.startsWith("data:")) {
      throw new Error(`Formato de ficheiro inválido: ${file.name}`);
    }
  }

  return {
    nome,
    email,
    telefone,
    localidade,
    mensagem,
    files,
  };
}
