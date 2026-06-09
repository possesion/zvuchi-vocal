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

// ─── Profile ──────────────────────────────────────────────────────────────────

export const ProfileSchema = yup.object({
    name: yup.string().min(2, 'Имя не должно быть короче 2 символов').max(50, 'Имя не должно превышать 50 символов').default(''),
    phone: yup.string().matches(/^(\+7\d{10})?$/, 'Неверный формат номера').default(''),
});

export type ProfileForm = yup.InferType<typeof ProfileSchema>;

// ─── Enrollment / Contact ─────────────────────────────────────────────────────

export const ContactSchema = yup.object({
    name: yup.string().min(2, 'Введите имя').required('Введите имя').trim(),
    phone: yup
        .string()
        .matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите номер в формате +7 (999) 000-00-00')
        .required('Введите номер телефона'),
    isAgreed: yup.boolean().oneOf([true], 'Необходимо согласие').required(),
});

export type ContactForm = yup.InferType<typeof ContactSchema>;

// ─── News ─────────────────────────────────────────────────────────────────────

export const NewsSchema = yup.object({
    title: yup.string().required('Введите заголовок').trim(),
    summary: yup.string().required('Введите краткое описание').trim(),
    content: yup.string().required('Введите текст новости').trim(),
    published_at: yup.string().default(''),
});

export type NewsForm = yup.InferType<typeof NewsSchema>;

// ─── Instructor ───────────────────────────────────────────────────────────────

export const InstructorSchema = yup.object({
    name: yup.string().required('Введите имя педагога').min(2, 'Имя слишком короткое').trim(),
    specialty: yup.string().default('').trim(),
    feature: yup.string().default('').trim(),
    experience: yup.string().default('').trim(),
    bio: yup.string().default('').trim(),
    image: yup.string().default('').trim(),
    video: yup.string().default('').trim(),
    sortOrder: yup.number().integer().min(0).default(0),
    slug: yup.string().default(''),
    presentationVideo: yup.string().default('').trim(),
    performanceVideos: yup.string().default('').trim(),
    techniques: yup.array().of(yup.string().required()).default([]),
});

export type InstructorForm = yup.InferType<typeof InstructorSchema>;

// ─── Payment ──────────────────────────────────────────────────────────────────

export const PaymentSchema = yup.object({
    amount: yup.number().positive('Сумма должна быть положительной').required('Введите сумму'),
    purpose: yup.string().required('Введите назначение платежа').trim(),
    Client: yup.object({
        name: yup.string().required('Введите ФИО').trim(),
        email: yup
            .string()
            .email('Некорректный формат email')
            .required('Введите email')
            .trim(),
    }).required(),
});

export type PaymentForm = yup.InferType<typeof PaymentSchema>;
