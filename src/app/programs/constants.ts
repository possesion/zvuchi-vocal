export const LevelMultipliers = {
  expert: 1.0,
  master: 1.4
} as const;

export const MentorLevel = {
  expert: { value: 'expert', title: 'Эксперт', multiplier: 1.0 },
  master: { value: 'master', title: 'Мастер', multiplier: 1.4 }
} as const;