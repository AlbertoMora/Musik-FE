import React, { useEffect, useState, useRef } from 'react';
import 'animate.css';
import { animatedComponent, animations } from '@/constants/animation-constants';

interface AnimatedUnmountProps {
    show: boolean;
    children: React.ReactNode;
    onUnmount?: () => void; // opcional
    enter?: string;
    exit?: string;
    customClass?: string;
    duration?: string;
}

export const AnimatedUnmountWrapper: React.FC<AnimatedUnmountProps> = ({
    show,
    children,
    onUnmount,
    customClass,
    enter = animations.entrances.fadeIn,
    exit = animations.exits.fadeOut,
    duration,
}) => {
    const [shouldRender, setShouldRender] = useState(show);
    const [animation, setAnimation] = useState(enter);
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleShow = () => {
            setShouldRender(true);
            setAnimation(enter);
        };

        const handleHide = () => {
            if (nodeRef.current) {
                setAnimation(exit);
                const handler = () => {
                    setShouldRender(false);
                    onUnmount?.();
                };
                const node = nodeRef.current;
                node.addEventListener('animationend', handler, { once: true });
                return () => node.removeEventListener('animationend', handler);
            } else {
                setShouldRender(false);
                onUnmount?.();
            }
        };
        if (show) {
            handleShow();
        } else {
            const cleanup = handleHide();
            return cleanup;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    if (!shouldRender) return null;

    return (
        <div
            ref={nodeRef}
            className={`${animatedComponent} ${duration ?? ''} ${animation} ${customClass ?? ''}`}>
            {children}
        </div>
    );
};
