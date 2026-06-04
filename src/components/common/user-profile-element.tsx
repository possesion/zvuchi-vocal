import { FC } from "react";

interface UserProfileElementProps {
    title: string;
    value: string;
}

export const UserProfileElement: FC<UserProfileElementProps> = ({title, value }) => {
    return (
        <div className="flex items-start justify-between border-b border-white/10 pb-7">
            <span className="text-white/70">{title}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}