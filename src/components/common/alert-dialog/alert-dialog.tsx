import { AlertDialog as AlertDialogBase, Button, Flex } from "@radix-ui/themes"
import { FC, ReactElement } from "react";

interface AlertDialogProps {
    children?: ReactElement;
    title: string;
    cancelText?: string;
    confirmText?: string;
    description?: string;
    width?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    disabled?: boolean;
}

export const AlertDialog: FC<AlertDialogProps> = ({ 
    children, 
    cancelText = 'Отменить', 
    confirmText = 'Подтвердить', 
    description, 
    title, 
    width = '450px',
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    disabled = false,
}) => {
    if (open !== undefined && onOpenChange) {
        return (
            <AlertDialogBase.Root open={open} onOpenChange={onOpenChange}>
                <AlertDialogBase.Content maxWidth={width}>
                    <AlertDialogBase.Title>{title}</AlertDialogBase.Title>
                    <AlertDialogBase.Description size="2">
                        {description}
                    </AlertDialogBase.Description>

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialogBase.Cancel>
                            <Button variant="soft" color="gray" onClick={onCancel}>
                                {cancelText}
                            </Button>
                        </AlertDialogBase.Cancel>
                        <AlertDialogBase.Action>
                            <Button 
                                type="button" 
                                variant="solid" 
                                color="red" 
                                onClick={onConfirm}
                                disabled={disabled}
                            >
                                {confirmText}
                            </Button>
                        </AlertDialogBase.Action>
                    </Flex>
                </AlertDialogBase.Content>
            </AlertDialogBase.Root>
        );
    }

    // Неуправляемый режим (с trigger children)
    return (
        <AlertDialogBase.Root>
            <AlertDialogBase.Trigger>
                {children}
            </AlertDialogBase.Trigger>
            <AlertDialogBase.Content maxWidth={width}>
                <AlertDialogBase.Title>{title}</AlertDialogBase.Title>
                <AlertDialogBase.Description size="2">
                    {description}
                </AlertDialogBase.Description>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialogBase.Cancel>
                        <Button variant="soft" color="gray" onClick={onCancel}>
                            {cancelText}
                        </Button>
                    </AlertDialogBase.Cancel>
                    <AlertDialogBase.Action>
                        <Button 
                            type="button" 
                            variant="solid" 
                            color="red" 
                            onClick={onConfirm}
                            disabled={disabled}
                        >
                            {confirmText}
                        </Button>
                    </AlertDialogBase.Action>
                </Flex>
            </AlertDialogBase.Content>
        </AlertDialogBase.Root>
    )
}