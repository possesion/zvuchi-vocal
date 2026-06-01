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

export const ProgramSchema = yup.object({
    title: yup.string().required('Введите название').trim(),
    short_description: yup.string().required('Введите краткое описание').trim(),
    full_description: yup.string().required('Введите полное описание').trim(),
    packages: yup.array().of(
        yup.object({
            lessons_count: yup.number().positive('Количество занятий должно быть положительным').required(),
            price: yup.number().positive('Цена должна быть положительной').required(),
        })
    ).min(1, 'Добавьте хотя бы один пакет').required(),
    lesson_duration: yup.number().positive('Длительность урока должна быть положительной').default(55),
    program_duration: yup.number().positive('Срок действия должен быть положительным').required('Введите срок действия'),
    features: yup.string().default(''),
    is_popular: yup.boolean().default(false),
    sort_order: yup.number().default(0),
});

export type ProgramForm = {
    title: string
    short_description: string
    full_description: string
    packages: Array<{
        lessons_count: number
        price: number
    }>
    lesson_duration: number
    program_duration: number
    features: string
    is_popular: boolean
    sort_order: number
}
