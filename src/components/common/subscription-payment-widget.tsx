import { SUBSCRIPTION_LINKS } from "@/app/constants"
import { SubscriptionLink } from "./subscription-link"

export const SubscriptionsPaymentWidget = () => {
    return (
        <div className="mt-4 w-full">
            <div className="flex flex-col text-lg font-semibold pb-4 gap-4 md:gap-6">
                {SUBSCRIPTION_LINKS.map(({ name, count, duration, price, link }) => (
                    <div
                        key={link}
                        className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-md"
                    >
                            <h3 className="mb-4 text-center text-xl font-bold text-gray-800">
                            {name}
                        </h3>
                        <div className="flex justify-between items-end">
                        <div>
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