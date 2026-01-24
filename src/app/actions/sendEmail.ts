'use server'

import nodemailer from 'nodemailer'
// import sendmail from 'sendmail';

interface SendEmailProps {
    name: string
    phone: string
    preferredDate?: string
    formType?: 'enrollment-form' | 'promo'
}

const formTypeText = {
    'enrollment-form': 'форма записи',
    promo: 'сезонная промо-кампания',
    default: 'модальное окно',
}

const transporter = nodemailer.createTransport({
    debug: true,
    logger: true,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
})

export async function sendEmail({ name, phone, preferredDate, formType }: SendEmailProps) {
    // Валидация переменных окружения
    if (
        !process.env.EMAIL_HOST ||
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASSWORD
    ) {
        throw new Error(
            'SMTP настройки не настроены. Проверьте переменные окружения.'
        )
    }

    try {
        // Проверяем подключение к SMTP
        transporter.verify((error) => {
            if (error) {
                console.error(error)
            } else {
                console.log('Server is ready to take our messages')
            }
        })
        console.log('SMTP подключение успешно', { name, phone })

        // Формируем текст письма
        const preferredDateText = preferredDate
            ? `Желаемая дата урока: ${new Date(preferredDate).toLocaleDateString('ru-RU')}`
            : 'Желаемая дата урока: не указана';

        const emailText = `
            Новая заявка на обучение вокалу (${formTypeText[formType || 'default']}):
            Имя: ${name}
            Телефон: ${phone}
            ${preferredDateText}
            Дата заявки: ${new Date().toLocaleString('ru-RU')}
                `.trim()

        const info = await transporter.sendMail({
            from: {
                name: 'Вокальная школа ЗВУЧИ',
                address: process.env.EMAIL_FROM ?? '',
            },
            to: process.env.EMAIL_TO,
            cc: process.env.EMAIL_TO_COPY,
            subject: `Новая заявка на обучение вокалу от ${name}`,
            text: emailText,
            html: `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ab1515;">
            <h2 style="color: #ab1515; margin-top: 0;">🎵 Новая заявка на обучение вокалу</h2>
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Имя:</strong> ${name}</p>
              <p><strong>Телефон:</strong> ${phone}</p>
              ${preferredDate ? `<p><strong>Желаемая дата урока:</strong> ${new Date(preferredDate).toLocaleDateString('ru-RU')}</p>` : '<p><strong>Желаемая дата урока:</strong> не указана</p>'}
              <p><strong>Источник:</strong> ${formTypeText[formType || 'default']}</p>
              <p><strong>Дата заявки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              Это автоматическое уведомление с сайта вокальной школы ЗВУЧИ.
              Пожалуйста, свяжитесь с клиентом в ближайшее время.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Вокальная школа ЗВУЧИ</p>
            <p>Сайт: <a href="https://zvuchi.ru" style="color: #ab1515;">zvuchi.ru</a></p>
          </div>`,
            priority: 'high',
        })

        console.log('Письмо отправлено успешно')
        return info
        // return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Ошибка при отправке:', error)
        throw new Error(
            `Ошибка при отправке email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        )
    }
}
