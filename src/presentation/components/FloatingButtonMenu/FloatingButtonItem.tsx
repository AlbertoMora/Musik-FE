import { Button } from '@mantine/core';
import React from 'react';

interface IFloatingButtonItemProps {
    icon: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const FloatingButtonItem = ({ icon, onClick }: IFloatingButtonItemProps) => {
    return (
        <Button className='fbm-button' onClick={onClick}>
            {icon}
        </Button>
    );
};

export default FloatingButtonItem;
