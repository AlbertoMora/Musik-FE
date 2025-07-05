import React from 'react';

import '../../styles/components/forms.sass';

interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

const FormGroup = ({ children, className }: FormGroupProps) => {
    return <div className={`form-group w-full ${className}`}>{children}</div>;
};

export default FormGroup;
