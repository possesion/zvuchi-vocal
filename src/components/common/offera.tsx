import { Dialog, VisuallyHidden } from "@radix-ui/themes"
import { PlatformDialog } from "../modals/platform-dialog"
import { FC, ReactNode, useState } from "react";
import { Loader } from "lucide-react";

interface OfferaProps {
    children: ReactNode;
}

export const Offera: FC<OfferaProps> = ({ children }) => {
    const [docIsloaded, setDocIsloaded] = useState(false);

    return (
        <PlatformDialog className='w-[380px] sm:w-[440px] md:w-[600px] lg:w-[800px]' trigger={children}>
            <VisuallyHidden>
                <Dialog.Title className="text-2xl font-bold mb-4"></Dialog.Title>
            </VisuallyHidden>
            <div className="relative h-full w-full flex justify-center">
                {!docIsloaded && <Loader className='absolute w-10 h-10 animate-spin top-[50%] left-[45%]' />}
                <iframe onLoad={() => setDocIsloaded(true)} className="h-[90dvh] w-full" src="https://docs.google.com/document/d/e/2PACX-1vSN4ggXtQlHcBsorG2yAkSHmbykhmv89sABuuwBJVDZXusPuYJoA0iW1CDiQtEKAmgGEUcmly7MUkeG/pub?embedded=true"></iframe>
            </div>
        </PlatformDialog>
    )
}