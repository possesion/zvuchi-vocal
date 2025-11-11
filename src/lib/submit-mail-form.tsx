export const submitMailForm = async (data: unknown) => {
        try {
            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                return { ok: true, data: result };
            } else {
                return { ok: false, error: result.error || 'Произошла ошибка' };
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            return { ok: false, error: 'Произошла ошибка при отправке' };
        }
    };
