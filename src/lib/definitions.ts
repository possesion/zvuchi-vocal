import * as yup from 'yup';

export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 180; // 180 дней

export const LoginSchema = yup.object({
    email: yup.string().email('Некорректный формат email').required('Введите email').trim(),
    password: yup
        .string()
        .min(1, 'Введите пароль')
        .min(8, 'Пароль должен содержать не менее 8 символов')
        .required('Введите пароль')
        .trim(),
    rememberMe: yup.boolean().default(false),
});

export type LoginForm = yup.InferType<typeof LoginSchema>;

export const RegisterSchema = yup.object({
    email: yup.string().email('Некорректный формат email').required('Введите email').trim(),
    password: yup
        .string()
        .min(8, 'Пароль должен содержать не менее 8 символов')
        .required('Введите пароль')
        .trim(),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Пароли не совпадают')
        .required('Подтвердите пароль'),
});

export type RegisterForm = yup.InferType<typeof RegisterSchema>;

export const ForgotPasswordSchema = yup.object({
    email: yup.string().email('Некорректный формат email').required('Введите email').trim(),
});

export type ForgotPasswordForm = yup.InferType<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = yup.object({
    password: yup
        .string()
        .min(8, 'Пароль должен содержать не менее 8 символов')
        .required('Введите пароль')
        .trim(),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Пароли не совпадают')
        .required('Подтвердите пароль'),
});

export type ResetPasswordForm = yup.InferType<typeof ResetPasswordSchema>;
