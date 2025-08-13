import { Button } from '@mantine/core';
import React, { ReactElement, useRef, useState } from 'react';

import '../../styles/components/floating-button-menu.sass';
import FloatingButtonItem from './FloatingButtonItem';
import { AnimatedUnmountWrapper } from '../animation/AnimationUnmountWrapper';

interface IFloatingButtonMenuProps {
    children: ReactElement<typeof FloatingButtonItem> | ReactElement<typeof FloatingButtonItem>[];
    className?: string;
    buttonClassname?: string;
    buttonLabel?: React.ReactNode | string;
}

const FloatingButtonMenu = ({
    children,
    className,
    buttonClassname,
    buttonLabel,
}: IFloatingButtonMenuProps) => {
    const buttonRef = useRef(null);
    const [show, setShow] = useState(false);

    return (
        <div className={`fbm-container ${className}`}>
            <AnimatedUnmountWrapper
                show={show}
                customClass='absolute'
                enter='animate__bounceInUp'
                exit='animate__backOutDown'
                duration='animate__faster'>
                <div className='fbm-content'>{children}</div>
            </AnimatedUnmountWrapper>
            <Button
                onClick={() => setShow(!show)}
                className={`fbm-button ${buttonClassname}`}
                type='button'
                ref={buttonRef}>
                {buttonLabel}
            </Button>
        </div>
    );
};

export default FloatingButtonMenu;
