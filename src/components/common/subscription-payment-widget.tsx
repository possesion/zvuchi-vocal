import { SUBSCRIPTION_LINKS } from "@/app/constants"
import { SubscriptionLink } from "./subscription-link"

export const SubscriptionsPaymentWidget = () => {
    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 md:gap-6">
                {SUBSCRIPTION_LINKS.map(({ name, link }) => (
                    <div
                        key={name}
                        className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-md"
                    >
                        <h3 className="mb-4 text-center text-lg font-bold text-gray-800">
                            {name}
                        </h3>
                        <div className="mt-auto primary-bg rounded-md">
                            <SubscriptionLink link={link} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}