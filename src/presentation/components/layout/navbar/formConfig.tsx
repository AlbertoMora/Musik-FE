import { formErrors } from '@/constants/form-constants';
import { yupResolver } from 'mantine-form-yup-resolver';
import * as Yup from 'yup';

const loginFormSchema = Yup.object().shape({
    username: Yup.string().required(formErrors.requiredErr).min(3, formErrors.sizeErr),
    password: Yup.string().required(formErrors.requiredErr).min(8, formErrors.sizeErr),
});

export const loginFormConfig = {
    initialValues: {
        username: '',
        password: '',
    },
    validate: yupResolver(loginFormSchema),
};

const signUpFormSchema = Yup.object().shape({
    username: Yup.string().required(formErrors.requiredErr).min(3, formErrors.sizeErr),
    email: Yup.string().required(formErrors.requiredErr).email(formErrors.emailErr),
    password: Yup.string().required(formErrors.requiredErr).min(8, formErrors.sizeErr),
    conf_password: Yup.string().required(formErrors.requiredErr).min(8, formErrors.sizeErr),
});

export const signUpFormConfig = {
    initialValues: {
        username: '',
        email: '',
        password: '',
        conf_password: '',
        isFormLoading: false,
    },
    validate: yupResolver(signUpFormSchema),
};
