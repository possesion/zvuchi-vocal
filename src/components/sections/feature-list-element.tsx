'use client';

import { FC, ReactElement } from "react";
import { PromoContent } from "./promo-content";

interface FeatureListElement {
    description: ReactElement;
    id: number;
    image: string;
    title: string;
}

export const FeatureListElement: FC<FeatureListElement> = ({ description, id, image, title }) => {

    if (title === 'promo') {
        return <PromoContent />;
    }
    return (
            <section className="flex justify-center items-center">
                <div className="flex flex-col gap-6 overflow-auto text-white sm:gap-2 md:flex-row lg:gap-4">
                    <article
                        key={id}
                        className="flex h-[600px] w-full flex-col items-center justify-end rounded-sm bg-cover bg-image p-6 text-center shadow-sm sm:w-[380px]" // xl:h-[600px]
                        style={{ backgroundImage: `url(${image})` }}
                    >
                        <div className="h-[400px] rounded-sm bg-linear-to-b from-black/70 to-transparent pt-2">
                            <h3 className="mb-2 text-xl font-bold">{title}</h3>
                            <p className="px-1 text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </article>
                </div>
            </section>
        // </section>
    );
};
