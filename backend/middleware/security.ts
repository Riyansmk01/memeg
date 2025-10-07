import { APIError } from "encore.dev/api";
import db from "../db";

export async function checkRateLimit(identifier: string, endpoint: string, limit: number = 100): Promise<void> {
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - 1);

  const current = await db.queryRow<{ count: number }>`
    SELECT count::int as count 
    FROM rate_limits 
    WHERE identifier = ${identifier} 
      AND endpoint = ${endpoint}
      AND window_start >= ${windowStart}
  `;

  if (current && current.count >= limit) {
    throw APIError.resourceExhausted("Terlalu banyak permintaan. Silakan coba lagi nanti.");
  }

  await db.exec`
    INSERT INTO rate_limits (identifier, endpoint, count, window_start)
    VALUES (${identifier}, ${endpoint}, 1, NOW())
    ON CONFLICT (identifier, endpoint, window_start) 
    DO UPDATE SET count = rate_limits.count + 1
  `;
}

export function validateInput(value: string, fieldName: string, minLength: number = 1, maxLength: number = 255): void {
  if (!value || value.trim().length < minLength) {
    throw APIError.invalidArgument(`${fieldName} harus diisi minimal ${minLength} karakter`);
  }
  
  if (value.length > maxLength) {
    throw APIError.invalidArgument(`${fieldName} tidak boleh lebih dari ${maxLength} karakter`);
  }

  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)|(-{2})|(\*\/)|(\bOR\b.*=.*)|(\bAND\b.*=.*)/i;
  if (sqlInjectionPattern.test(value)) {
    throw APIError.invalidArgument(`${fieldName} mengandung karakter tidak valid`);
  }
}

export function validateNumber(value: number, fieldName: string, min?: number, max?: number): void {
  if (isNaN(value) || !isFinite(value)) {
    throw APIError.invalidArgument(`${fieldName} harus berupa angka yang valid`);
  }

  if (min !== undefined && value < min) {
    throw APIError.invalidArgument(`${fieldName} tidak boleh kurang dari ${min}`);
  }

  if (max !== undefined && value > max) {
    throw APIError.invalidArgument(`${fieldName} tidak boleh lebih dari ${max}`);
  }
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
