import { Input, InputBase, Combobox, useCombobox, InputProps } from '@mantine/core';

interface ICommonComboboxProps extends InputProps {
    options: string[];
    value: string;
    setValue: (value: string) => void;
    placeholder?: string;
    label?: string | React.ReactNode;
}

export default function CommonCombobox({
    options,
    className,
    value,
    setValue,
    placeholder = 'Pick value',
    label,
}: ICommonComboboxProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const opts = options.map(item => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={val => {
                setValue(val);
                combobox.closeDropdown();
            }}>
            <Combobox.Target>
                <InputBase
                    component='button'
                    type='button'
                    pointer
                    label={label}
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents='none'
                    className={`${className} min-w-35`}
                    onClick={() => combobox.toggleDropdown()}>
                    {value || <Input.Placeholder>{placeholder}</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown className='combobox-background'>
                <Combobox.Options>{opts}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
