import { MentorLevelValue } from "@/app/programs/types";

export const levelStyles: Record<MentorLevelValue, { bg: string; text: string; }> = {
    expert: {
        bg: 'cursor-pointer bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% group mx-auto block overflow-hidden rounded-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-[rgb(88,22,66)]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        text: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]',
    },
    master: {
        bg: 'cursor-pointer bg-radial-[at_40%] from-red-800 to-red-950 to-80% group mx-auto block overflow-hidden rounded-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-[rgb(88,22,66)]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        text: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]',
    }
}

export const USER_FIELDS = ['Email', 'Роль', 'Статус', 'Дата регистрации', ''];

export const STUDIO_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
    src: `/interior/${i}.jpg`,
    alt: `Студия фото ${i + 1}`,
}));
