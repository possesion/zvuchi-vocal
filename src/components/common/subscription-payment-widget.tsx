import { SUBSCRIPTION_LINKS } from "@/app/constants"
import { SubscriptionLink } from "./subscription-link"

export const SubscriptionsPaymentWidget = () => {
    return (
        <div className="mt-4 w-full">
            <div className="flex flex-col text-white font-semibold pb-4 gap-4 md:text-lg md:gap-6">
                {SUBSCRIPTION_LINKS.map(({ name, count, duration, price, link }) => (
                    <div
                        key={link}
                        className="flex flex-1 flex-col rounded-sm bg-black/50 p-4 shadow-md md:p-6"
                    >
                            <h3 className="mb-2 text-center text-xl font-bold md:mb-4">
                            {name}
                        </h3>
                        <div className="flex flex-col justify-between sm:items-end sm:flex-row">
                        <div className="pb-2 sm:pb-0">
                            <p>
                                Количество занятий: <b>{count}</b>
                            </p>
                            <p>
                                Длительность занятия: <b>{duration} мин</b>
                            </p>
                            <p>
                                Цена: <b>{price} руб.</b>
                            </p>
                        </div>
                            <SubscriptionLink link={link} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}