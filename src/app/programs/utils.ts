import { LevelMultipliers } from "./constants";
import { MentorLevelValue, Package } from "./types";

export const formatPrice = (price: number) => {   
        return new Intl.NumberFormat('ru-RU').format(price) + '₽';
    };

    export const pricePerLesson = (pkg: Package, selectedLevel: MentorLevelValue) => {
        const adjustedPrice = Math.round(pkg.price * LevelMultipliers[selectedLevel]);
        return Math.round(adjustedPrice / pkg.lessons_count);
    };

    export const getAdjustedPrice = (pkg: Package, selectedLevel: MentorLevelValue) => {
        const finalPrice = pkg.price * LevelMultipliers[selectedLevel];
        return Math.round(finalPrice / 100) * 100;
    };