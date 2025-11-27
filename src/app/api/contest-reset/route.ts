import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'contest-votes.json');

interface Contestant {
  id: number;
  name: string;
  song: string;
  votes: number;
  photo?: string;
}

const initialContestants: Contestant[] = [
  { id: 2, photo: '/contest/k-dima.jpeg', name: 'Коновалов Дмитрий', song: 'Half a man - Dean Lewis', votes: 0 },
  { id: 3, photo: '/contest/l-sasha.jpeg', name: 'Лушникова Александра', song: 'I miss the misery - Halestorm', votes: 0 },
  { id: 4, photo: '/contest/l-ekaterina.jpeg', name: 'Левочкина Екатерина', song: 'Сколько шансов у любви - Садковская', votes: 0 },
  { id: 5, photo: '/contest/n-evgenia.jpeg', name: 'Николаева Евгения', song: 'Somebody to love - Queen', votes: 0 },
  { id: 6, photo: '/contest/b-anna.jpeg', name: 'Бродкина Анна', song: 'Born to Die - Lana del Rey', votes: 0 },
  { id: 7, photo: '/contest/s-vlada.jpeg', name: 'Сахенко Владислава', song: "You've got the love - Florence and the machine", votes: 0 },
  { id: 8, photo: '/contest/p-sonya.jpeg', name: 'Поликарпова Софья', song: 'Дыши - Ваня Дмитриенко', votes: 0 },
  { id: 24, photo: '/contest/s-yula.jpeg', name: 'Семерникова Юлия', song: 'Million Dollar - Anouk', votes: 0 },
  { id: 10, photo: '/contest/n-polina.jpeg', name: 'Некрасова Полина', song: 'Vision of love - Mariah Carey', votes: 0 },
  { id: 12, photo: '/contest/k-nastya.jpeg', name: 'Кабанова Анастасия', song: 'Turning Tables - Adele', votes: 0 },
  { id: 13, photo: '/contest/burova-anna.jpeg', name: 'Бурова Анна', song: 'Стану песней - Ubel', votes: 0 },
  { id: 14, photo: '/contest/y-kirill.jpeg', name: 'Ярин Кирилл', song: 'Viper room - Thornhill', votes: 0 },
  { id: 15, photo: '/contest/duo.svg', name: 'Дуэт А.Бродкина и Е.Николаева', song: 'Desert Rose - Sting', votes: 0 },
  { id: 16, photo: '/contest/duo.svg', name: 'Дуэт Д.Коновалов и А.Кабанова', song: 'Последний день Помпеи - Сергей Лазарев', votes: 0 },
  { id: 18, photo: '/contest/ch-sasha.PNG', name: 'Чижикова Александра', song: 'Come Home – Willow', votes: 0 },
  { id: 19, photo: '/contest/k-natalya.jpeg', name: 'Климова Наталья', song: 'Путь – Ольга Кормухина', votes: 0 },
  { id: 20, photo: '/contest/p-nikita.jpeg', name: 'Письменный Никита', song: 'Survive – Lewis Capaldi', votes: 0 },
  { id: 21, photo: '/contest/m-sergei.jpeg', name: 'Мерсов Сергей', song: 'Нищая – Александр Малинин', votes: 0 },
  { id: 22, photo: '/contest/s-elena.jpeg', name: 'Стребнева Елена', song: "Who's lovin you – Jennie Lena", votes: 0 },
  { id: 23, photo: '/contest/k-marina.jpeg', name: 'Коробкова Марина', song: 'ЯД – Эрика Лундомен', votes: 0 },
];

const RESET_PASSWORD = 'gothor123';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Проверяем пароль
    if (password !== RESET_PASSWORD) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const dataDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ contestants: initialContestants }, null, 2)
    );

    // Создаем ответ с очисткой cookie
    const response = NextResponse.json({
      success: true,
      message: 'Результаты голосования успешно сброшены',
      contestants: initialContestants
    });

    // Удаляем cookie hasVoted
    response.cookies.set('hasVoted', '', {
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json(
      { error: 'Не удалось сбросить результаты голосования' },
      { status: 500 }
    );
  }
}
