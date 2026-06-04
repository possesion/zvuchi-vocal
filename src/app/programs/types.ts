export interface Package {
    lessons_count: number;
    price: number;
}

export interface ProgramPricingTabsProps {
    packages: Package[];
}