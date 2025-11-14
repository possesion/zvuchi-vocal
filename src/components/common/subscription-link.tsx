import { FC } from "react";

interface SubbscriptionLinkProps {
    link: string;
}

export const SubscriptionLink: FC<SubbscriptionLinkProps> = ({ link }) => {
    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-13 bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% text-white px-6 py-3 rounded-lg transition-all duration-300 hover:violet-950/80 hover:shadow-lg hover:shadow-violet-900/30"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
            <span className="relative font-bold">Оплатить</span>
        </a>
    )
}