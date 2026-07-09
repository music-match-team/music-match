export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push("La password è obbligatoria");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("La password deve contenere almeno 8 caratteri");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera maiuscola");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La password deve contenere almeno una lettera minuscola");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("La password deve contenere almeno un numero");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La password deve contenere almeno un carattere speciale (!@#$%^&* ecc.)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
