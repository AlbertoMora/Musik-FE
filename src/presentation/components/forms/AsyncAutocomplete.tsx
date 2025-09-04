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
import { IActionResponse } from '../../../domain/auth/auth-gateway';

export interface IAsyncAutocompleteItem {
    value: string;
    label: string;
    imageUrl?: string;
}

interface II18nProps {
    placeholder: string;
    not_found_create?: string;
    not_found?: string;
    typeToFind?: string;
}

interface IComboboxProps extends TextInputProps {
    setValue: (value: string) => void;
    label?: string | React.ReactNode;
    value: string;
    fetchData: (value: string) => void;
    data: IAsyncAutocompleteItem[] | null;
    loading?: boolean;
    i18n: II18nProps;
    dynamicCreate?: { format: string; createAction: unknown; property: string };
}

const AsyncAutocomplete = ({
    setValue,
    value,
    data,
    loading,
    fetchData,
    dynamicCreate,
    label,
    i18n,
    ...rest
}: IComboboxProps) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [inputValue, setInputValue] = useState('');
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    const createItemHandler = async () => {
        if (inputValue.length < 3 || !dynamicCreate) {
            return;
        }
        setIsCreatingItem(true);
        const values = {
            [dynamicCreate.format]: inputValue,
        };
        const createAction = dynamicCreate.createAction as (
            arg: unknown
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => Promise<IActionResponse<any>>;

        const res = await createAction(values);
        const id = res.data[dynamicCreate.property]?.id ?? '';
        combobox.resetSelectedOption();
        combobox.closeDropdown();
        setValue(id);
        setIsCreatingItem(false);
    };

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
                    placeholder={i18n.placeholder}
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
                            {(() => {
                                if (inputValue.length === 0) {
                                    return i18n.typeToFind;
                                } else if (!dynamicCreate) {
                                    return i18n.not_found;
                                } else {
                                    return !isCreatingItem ? (
                                        <button
                                            type='button'
                                            className='asyncacomplete-create-button'
                                            onClick={createItemHandler}>
                                            {inputValue} {i18n.not_found_create}
                                        </button>
                                    ) : (
                                        <Loader size={10} />
                                    );
                                }
                            })()}
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
