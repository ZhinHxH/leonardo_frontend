import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormData {
  [key: string]: string;
}

export const useFormValidation = (initialData: FormData, validationRules: ValidationRules) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Validación requerida
    if (rules.required && (!value || value.trim() === '')) {
      return 'Este campo es requerido';
    }

    // Si el campo está vacío y no es requerido, no hay error
    if (!value || value.trim() === '') {
      return null;
    }

    // Validación de longitud mínima
    if (rules.minLength && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }

    // Validación de longitud máxima
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    // Validación de patrón
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Validación personalizada
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules, validateField]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar el campo en tiempo real si ya hay un error
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [errors, validateField]);

  const handleBlur = useCallback((name: string) => {
    const error = validateField(name, formData[name] || '');
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldError,
    clearFieldError,
    setFormData
  };
};

// Validaciones comunes
export const validations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un correo electrónico válido';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
      return null;
    }
  },
  required: {
    required: true
  }
};





