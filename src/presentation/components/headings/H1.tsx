import React from 'react';

interface IH1Props {
    children: React.ReactNode;
    className?: string;
}

const H1 = ({ children, className }: IH1Props) => {
    return (
        <h1
            className={`text-2xl/7 font-bold sm:truncate sm:text-3xl sm:tracking-tight ${
                className ?? ''
            }`}>
            {children}
        </h1>
    );
};

export default H1;
