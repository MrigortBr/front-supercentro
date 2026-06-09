interface ValidateLoginData {
    email: string;
    password: string;
}

interface ValidateLoginResponse {
    valid: boolean;
    errors: {
        email?: string;
        password?: string;
    };
}

export function validateLogin({ email, password }: ValidateLoginData): ValidateLoginResponse {
    const errors: ValidateLoginResponse["errors"] = {};

    // Email
    if (!email.trim()) {
        errors.email = "Email obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Email inválido";
    }

    // Senha
    if (!password.trim()) {
        errors.password = "Senha obrigatória";
    } else if (password.length < 6) {
        errors.password = "A senha deve ter pelo menos 6 caracteres";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}
