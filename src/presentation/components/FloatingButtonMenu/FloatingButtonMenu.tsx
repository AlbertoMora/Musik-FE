import { ActionIcon, Tooltip } from '@mantine/core';
import React, { ReactElement, useRef, useState } from 'react';

import '../../styles/components/floating-button-menu.sass';
import FloatingButtonItem from './FloatingButtonItem';
import { AnimatedUnmountWrapper } from '../animation/AnimationUnmountWrapper';
import { animations, animationSpeeds } from '@/constants/animation-constants';

interface IFloatingButtonMenuProps {
    children: ReactElement<typeof FloatingButtonItem> | ReactElement<typeof FloatingButtonItem>[];
    name: string;
    className?: string;
    buttonClassname?: string;
    buttonLabel?: React.ReactNode | string;
}

const FloatingButtonMenu = ({
    children,
    className,
    buttonClassname,
    buttonLabel,
    name,
}: IFloatingButtonMenuProps) => {
    const buttonRef = useRef(null);
    const [show, setShow] = useState(false);

    return (
        <div className={`fbm-container ${className}`}>
            <AnimatedUnmountWrapper
                show={show}
                customClass='absolute'
                enter={animations.entrances.bounceInUp}
                exit={animations.exits.backOutDown}
                duration={animationSpeeds.fastest}>
                <div className='fbm-content'>{children}</div>
            </AnimatedUnmountWrapper>
            <Tooltip label={name}>
                <ActionIcon
                    aria-label={name}
                    onClick={() => setShow(!show)}
                    className={`fbm-button ${buttonClassname}`}
                    type='button'
                    ref={buttonRef}>
                    {buttonLabel}
                </ActionIcon>
            </Tooltip>
        </div>
    );
};

export default FloatingButtonMenu;
