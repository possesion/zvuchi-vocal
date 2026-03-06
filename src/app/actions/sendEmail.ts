'use server';

import nodemailer from 'nodemailer';

interface QuizAnswers {
    experience: string;
    genre: string;
    motivation: string;
}

interface SendEmailProps {
    name: string;
    phone: string;
    formType?: 'enrollment-form' | 'promo' | 'quiz';
    quizAnswers?: QuizAnswers;
}

const formTypeText = {
    'enrollment-form': 'форма записи',
    promo: 'сезонная промо-кампания',
    quiz: 'опрос с получением скидки',
    default: 'модальное окно',
};

const transporter = nodemailer.createTransport({
    debug: true,
    logger: true,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendEmail({ name, phone, formType, quizAnswers }: SendEmailProps) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('SMTP настройки не настроены. Проверьте переменные окружения.');
    }

    try {
        transporter.verify((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });
        console.log('SMTP подключение успешно', { name, phone });

        let quizSection = '';
        if (formType === 'quiz' && quizAnswers) {
            quizSection = `
            
Ответы на опрос:
- Опыт занятий вокалом: ${quizAnswers.experience}
- Желаемый жанр: ${quizAnswers.genre}
- Мотивация: ${quizAnswers.motivation}

⭐ СКИДКА 70% НА ПЕРВОЕ ЗАНЯТИЕ ⭐
            `;
        }

        const emailText = `
Новая заявка на обучение вокалу (${formTypeText[formType || 'default']}):
Имя: ${name}
Телефон: ${phone}${quizSection}
Дата заявки: ${new Date().toLocaleString('ru-RU')}
        `.trim();

        let quizHtml = '';
        if (formType === 'quiz' && quizAnswers) {
            quizHtml = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">📋 Ответы на опрос:</h3>
              <p><strong>Опыт занятий вокалом:</strong> ${quizAnswers.experience}</p>
              <p><strong>Желаемый жанр:</strong> ${quizAnswers.genre}</p>
              <p><strong>Мотивация:</strong> ${quizAnswers.motivation}</p>
            </div>
            <div style="background: #d4edda; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #28a745; text-align: center;">
              <h3 style="color: #155724; margin-top: 0;">⭐ СКИДКА 70% НА ПЕРВОЕ ЗАНЯТИЕ ⭐</h3>
              <p style="color: #155724; margin: 0;">Клиент прошел опрос и получил специальную скидку!</p>
            </div>
            `;
        }

        const info = await transporter.sendMail({
            from: {
                name: 'Вокальная школа ЗВУЧИ',
                address: process.env.EMAIL_FROM ?? '',
            },
            to: process.env.EMAIL_TO,
            cc: process.env.EMAIL_TO_COPY,
            subject: `${formType === 'quiz' ? '🎁 ' : ''}Новая заявка на обучение вокалу от ${name}`,
            text: emailText,
            html: `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ab1515;">
            <h2 style="color: #ab1515; margin-top: 0;">🎵 Новая заявка на обучение вокалу</h2>
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Имя:</strong> ${name}</p>
              <p><strong>Телефон:</strong> ${phone}</p>
              <p><strong>Источник:</strong> ${formTypeText[formType || 'default']}</p>
              <p><strong>Дата заявки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            ${quizHtml}
            <p style="color: #666; font-size: 14px;">
              Это автоматическое уведомление с сайта вокальной школы ЗВУЧИ.
              Пожалуйста, свяжитесь с клиентом в ближайшее время.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Вокальная школа ЗВУЧИ</p>
            <p>Сайт: <a href="https://zvuchi-vocal.ru" style="color: #ab1515;">zvuchi-vocal.ru</a></p>
          </div>`,
            priority: 'high',
        });

        console.log('Письмо отправлено успешно');
        return info;
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        throw new Error(
            `Ошибка при отправке email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        );
    }
}
