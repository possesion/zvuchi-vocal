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

function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ contestants: initialContestants }, null, 2)
    );
  }
}

function readVotes(): { contestants: Contestant[] } {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeVotes(data: { contestants: Contestant[] }) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readVotes();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading votes:', error);
    return NextResponse.json(
      { contestants: initialContestants },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { contestantId } = await request.json();
    
    if (!contestantId) {
      return NextResponse.json(
        { error: 'Contestant ID is required' },
        { status: 400 }
      );
    }

    const data = readVotes();
    const contestant = data.contestants.find((c) => c.id === contestantId);
    
    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    contestant.votes += 1;
    writeVotes(data);

    return NextResponse.json({ success: true, contestant });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
