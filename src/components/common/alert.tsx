import { Callout } from "@radix-ui/themes"
import { Info } from "lucide-react"
import { FC } from "react"

interface CustomAlertProps extends Callout.RootProps {
    alertText: string;
}

export const CustomAlert: FC<CustomAlertProps> = ({ alertText, color, size = '2', variant }) => {
    return (
        <Callout.Root size={size} color={color} variant={variant}>
            <Callout.Icon>
                <Info />
            </Callout.Icon>
            <Callout.Text>
                {alertText}
            </Callout.Text>
        </Callout.Root>
    )
}