import { MentorLevel } from "./constants";

export interface Package {
  lessons_count: number;
  price: number;
}

export interface Lvl {
  value: 'expert' | 'master'
  title: 'Эксперт' | 'Мастер'
  multiplier: number
}

export type MentorLevelValue = keyof typeof MentorLevel;