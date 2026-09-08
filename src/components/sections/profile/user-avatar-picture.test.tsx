import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { UserAvatarPicture } from './user-avatar-picture';

// next/image renders an <img>; stub it to a plain img for jsdom.
vi.mock('next/image', () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

describe('UserAvatarPicture', () => {
    it('renders a rounded image at the given size with the provided alt when avatarUrl is set', () => {
        render(
            <UserAvatarPicture
                avatarUrl="https://avatars.yandex.net/get-yapic/x/islands-200"
                alt="Аватар пользователя Иван"
                size={40}
            />
        );
        const img = screen.getByAltText('Аватар пользователя Иван') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('width', '40');
        expect(img).toHaveAttribute('height', '40');
        expect(img.className).toContain('rounded-full');
        expect(img.className).toContain('object-cover');
    });

    it('renders nothing when avatarUrl is null', () => {
        const { container } = render(<UserAvatarPicture avatarUrl={null} alt="Аватар" size={40} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when avatarUrl is a blank string', () => {
        const { container } = render(<UserAvatarPicture avatarUrl="   " alt="Аватар" size={40} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('removes the image after an onError event', () => {
        render(
            <UserAvatarPicture
                avatarUrl="https://example.com/broken.png"
                alt="Аватар пользователя Иван"
                size={40}
            />
        );
        const img = screen.getByAltText('Аватар пользователя Иван');
        expect(img).toBeInTheDocument();

        fireEvent.error(img);

        expect(screen.queryByAltText('Аватар пользователя Иван')).not.toBeInTheDocument();
    });
});
