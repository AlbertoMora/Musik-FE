import { ActionIcon, Tooltip } from '@mantine/core';
import React from 'react';

interface IFloatingButtonItemProps {
    icon: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    name: string;
}

const FloatingButtonItem = ({ icon, onClick, name }: IFloatingButtonItemProps) => {
    return (
        <Tooltip label={name}>
            <ActionIcon className='fbm-button' onClick={onClick}>
                {icon}
            </ActionIcon>
        </Tooltip>
    );
};

export default FloatingButtonItem;
