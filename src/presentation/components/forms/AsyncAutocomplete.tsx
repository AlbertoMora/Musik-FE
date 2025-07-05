'use client';
import React, { useState } from 'react';
import {
    Avatar,
    Combobox,
    ComboboxDropdown,
    ComboboxOption,
    ComboboxTarget,
    Loader,
    TextInput,
    TextInputProps,
    useCombobox,
} from '@mantine/core';
import { v4 as uuid } from 'uuid';

export interface IAsyncAutocompleteItem {
    value: string;
    label: string;
    imageUrl?: string;
}

interface IComboboxProps extends TextInputProps {
    setValue: (value: string) => void;
    label?: string | React.ReactNode;
    value: string;
    fetchData: (value: string) => void;
    data: IAsyncAutocompleteItem[] | null;
    loading?: boolean;
}

const AsyncAutocomplete = ({
    setValue,
    value,
    data,
    loading,
    label,
    fetchData,
    ...rest
}: IComboboxProps) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [inputValue, setInputValue] = useState('');

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.currentTarget.value);
        fetchData(event.currentTarget.value);
        combobox.resetSelectedOption();
        combobox.openDropdown();
    };

    return (
        <Combobox
            onOptionSubmit={optionValue => {
                setValue(optionValue);
                setInputValue(data?.find(d => d.value === optionValue)?.label ?? '');
                combobox.closeDropdown();
            }}
            withinPortal={false}
            store={combobox}>
            <ComboboxTarget>
                <TextInput
                    {...rest}
                    label={label ?? ''}
                    value={inputValue}
                    onChange={onInputChange}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => {
                        combobox.openDropdown();
                        if (data === null) {
                            setValue(value);
                        }
                    }}
                    onBlur={() => combobox.closeDropdown()}
                    rightSection={loading && <Loader size={18} />}
                />
            </ComboboxTarget>

            <ComboboxDropdown className='combobox-background' hidden={data === null}>
                <Combobox.Options>
                    {(!data || data.length === 0) && (
                        <Combobox.Empty>
                            {inputValue.length === 0 ? 'Type to find an artist' : 'No Results'}
                        </Combobox.Empty>
                    )}

                    {data?.map(item => (
                        <ComboboxOption key={uuid()} value={item.value}>
                            <div className='flex items-center gap-2'>
                                {item.imageUrl ? <Avatar src={item.imageUrl}></Avatar> : null}
                                {item.label}
                            </div>
                        </ComboboxOption>
                    ))}
                </Combobox.Options>
            </ComboboxDropdown>
        </Combobox>
    );
};

export default AsyncAutocomplete;
