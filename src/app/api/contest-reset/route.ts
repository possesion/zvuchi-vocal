import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'contest-votes.json');

interface Contestant {
  id: number;
  name: string;
  song: string;
  votes: number;
}

const initialContestants: Contestant[] = [
  { id: 1, name: 'Акулич Мила', song: 'Девочка-харизма (собственная)', votes: 0 },
  { id: 2, name: 'Дмитрий Коновалов', song: 'Half a man - Dean Lewis', votes: 0 },
  { id: 3, name: 'Саша Лушникова', song: 'i miss the misery - Halestorm', votes: 0 },
  { id: 4, name: 'Екатерина Левочкина', song: 'Сколько шансов у любви - Садковская', votes: 0 },
  { id: 5, name: 'Николаева Женя', song: 'Somebody to love - Queen', votes: 0 },
  { id: 6, name: 'Бродкина Аня', song: 'Born to Die - Lana del Rey', votes: 0 },
  { id: 7, name: 'Владислава Сахенко', song: "You've got the love - Florence and the machine", votes: 0 },
  { id: 8, name: 'Поликарпова Софья', song: 'Дыши - Ваня Дмитриенко', votes: 0 },
  { id: 9, name: 'Семенов Святослав', song: '16 - Highly suspect', votes: 0 },
  { id: 10, name: 'Полина Некрасова', song: 'Vision of love - Mariah Carey', votes: 0 },
  { id: 11, name: 'Полина Некрасова', song: 'Собственная песня', votes: 0 },
  { id: 12, name: 'Кабанова Настя', song: 'Turning Tables - Adele', votes: 0 },
  { id: 13, name: 'Аня Бурова', song: 'Стану песней - Uber', votes: 0 },
  { id: 14, name: 'Кирилл Ярин', song: 'Viper room - Thornhill', votes: 0 },
  { id: 15, name: 'Дуэт Бродк и Николаева', song: 'Desert Rose - Sting', votes: 0 },
  { id: 16, name: 'Дуэт Конов и Кабанова', song: 'Последний день Помпеи - Сергей Лазарев', votes: 0 },
  { id: 17, name: 'Дуэт Лера и Яна', song: 'Мешап Останусь/Back to Black', votes: 0 },
  { id: 18, name: 'Александра Чижикова', song: 'Come Home', votes: 0 },
  { id: 19, name: 'Наталья Климова', song: 'Путь', votes: 0 },
  { id: 20, name: 'Никита Письменный', song: 'Survive', votes: 0 },
  { id: 21, name: 'Лиза Козлова', song: 'Little Runaway', votes: 0 },
  { id: 22, name: 'Елена Стребнева', song: "Who's lovin you", votes: 0 },
  { id: 23, name: 'Марина Коробкова', song: 'Яд', votes: 0 },
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

    return NextResponse.json({ 
      success: true, 
      message: 'Результаты голосования успешно сброшены',
      contestants: initialContestants 
    });
  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json(
      { error: 'Не удалось сбросить результаты голосования' },
      { status: 500 }
    );
  }
}
