import { formErrors } from '@/constants/form-constants';
import { yupResolver } from 'mantine-form-yup-resolver';
import * as Yup from 'yup';

const formConfigSchema = Yup.object().shape({
    name: Yup.string().required(formErrors.requiredErr).min(3, formErrors.sizeErr),
    lyrics: Yup.string().required(formErrors.requiredErr).min(10, formErrors.sizeErr),
    artist: Yup.string()
        .required(formErrors.requiredErr)
        .matches(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
            formErrors.regexErr
        ),
});

export const formConfig = {
    initialValues: {
        name: '',
        artist: '',
        key: '',
        genre: '',
        bpm: '',
        lyrics: '',
        artistListLoading: false,
        genreListLoading: false,
    },
    validate: yupResolver(formConfigSchema),
};
