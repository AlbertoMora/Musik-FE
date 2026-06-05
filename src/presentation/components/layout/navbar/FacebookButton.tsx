import React from 'react';
import { IconBrandFacebookFilled } from '@tabler/icons-react';

interface IFacebookButtonProps {
    text: string;
    onClick?: () => void;
}

const FacebookButton = ({ text, onClick }: IFacebookButtonProps) => {
    return (
        <button onClick={onClick} type='button' className='fb-material-button'>
            <span className='fb-material-button-icon'>
                <IconBrandFacebookFilled size={20} />
            </span>
            <span className='fb-material-button-contents'>{text}</span>
        </button>
    );
};

export default FacebookButton;
