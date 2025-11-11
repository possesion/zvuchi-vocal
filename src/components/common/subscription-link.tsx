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
            className="group relative block text-white overflow-hidden rounded-lg border border-brand/30 bg-gradient-to-br from-brand/10 to-brand/5 px-6 py-3 text-center font-semibold text-brand shadow-md transition-all duration-300 hover:from-brand/20 hover:to-brand/10 hover:shadow-lg hover:shadow-brand/30"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
            <span className="relative font-bold">Оплатить</span>
        </a>
    )
}