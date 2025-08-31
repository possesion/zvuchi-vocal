'use server';

import nodemailer from 'nodemailer';

interface SendEmailProps {
  name: string;
  phone: string;
}

export async function sendEmail({ name, phone }: SendEmailProps) {

  // Валидация переменных окружения
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP настройки не настроены. Проверьте переменные окружения.');
  }

  const transporter = nodemailer.createTransport({
    debug: true,
    logger: true,
    host: process.env.EMAIL_HOST,
    port: 587, //parseInt(process.env.EMAIL_PORT || '465'),
    secure: false, // Используем SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // tls: {
    //   rejectUnauthorized: false // Отключаем проверку сертификата для тестирования
    // }
  });

  try {
    // Проверяем подключение к SMTP
    await transporter.verify();
    console.log('SMTP подключение успешно', { name, phone });

    // Формируем текст письма
//     const emailText = `
// Новая заявка на обучение вокалу:
//
// Имя: ${name}
// Телефон: ${phone}
//
// Дата: ${new Date().toLocaleString('ru-RU')}
//     `.trim();

    // Отправляем письмо с  заголовками
    // await transporter.sendMail({
    //   from: {
    //     name: 'Вокальная школа ЗВУЧИ',
    //     address: process.env.EMAIL_FROM || ''
    //   },
    //   to: process.env.EMAIL_TO,
    //   replyTo: process.env.EMAIL_FROM, // Обратный адрес для ответов
    //   subject: `Новая заявка на обучение вокалу от ${name}`,
    //   text: emailText,
    //   // html: `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ab1515;">
    //   //       <h2 style="color: #ab1515; margin-top: 0;">🎵 Новая заявка на обучение вокалу</h2>
    //   //       <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
    //   //         <p><strong>Имя:</strong> ${name}</p>
    //   //         <p><strong>Телефон:</strong> ${phone}</p>
    //   //         <p><strong>Дата заявки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
    //   //       </div>
    //   //
    //   //       <p style="color: #666; font-size: 14px;">
    //   //         Это автоматическое уведомление с сайта вокальной школы ЗВУЧИ.
    //   //         Пожалуйста, свяжитесь с клиентом в ближайшее время.
    //   //       </p>
    //   //     </div>
    //   //     <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
    //   //       <p>© ${new Date().getFullYear()} Вокальная школа ЗВУЧИ</p>
    //   //       <p>Сайт: <a href="https://zvuchi.ru" style="color: #ab1515;">zvuchi.ru</a></p>
    //   //     </div>`,
    //   headers: {
    //     'X-Priority': '1', // Высокий приоритет
    //     'X-MSMail-Priority': 'High',
    //     'Importance': 'high',
    //     'X-Mailer': 'Node.js Nodemailer',
    //     'List-Unsubscribe': `<mailto:${process.env.EMAIL_FROM}?subject=unsubscribe>`,
    //     'Precedence': 'bulk'
    //   },
    //   priority: 'high'
    // });

    console.log('Письмо отправлено успешно');
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Ошибка при отправке:', error);
    throw new Error(`Ошибка при отправке email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}