'use server'

import nodemailer from 'nodemailer'
// import sendmail from 'sendmail';

interface SendEmailProps {
    name: string
    phone: string
}

const transporter = nodemailer.createTransport({
    debug: true,
    logger: true,
    host: 'sm29.hosting.reg.ru', // process.env.EMAIL_HOST,
    port: 587, //parseInt(process.env.EMAIL_PORT || '465'),
    auth: {
        user: 'noreply@zvuchi-vocal.ru', // process.env.EMAIL_USER,
        pass: 'Svck4051svck4051', // process.env.EMAIL_PASSWORD,
    },
})

export async function sendEmail({ name, phone }: SendEmailProps) {
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
        const emailText = `
Новая заявка на обучение вокалу:
Имя: ${name}
Телефон: ${phone}
Дата: ${new Date().toLocaleString('ru-RU')}
    `.trim()

        const info = await transporter.sendMail({
            from: {
                name: 'Вокальная школа ЗВУЧИ',
                address: 'noreply@zvuchi-vocal.ru', //process.env.EMAIL_FROM || ''
            },
            to: 'zvuchi.vocal@yandex.ru', //process.env.EMAIL_TO,
            subject: `Новая заявка на обучение вокалу от ${name}`,
            text: emailText,
            html: `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ab1515;">
            <h2 style="color: #ab1515; margin-top: 0;">🎵 Новая заявка на обучение вокалу</h2>
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Имя:</strong> ${name}</p>
              <p><strong>Телефон:</strong> ${phone}</p>
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
