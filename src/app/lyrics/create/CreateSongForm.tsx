'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import FormGroup from '@/presentation/components/forms/FormGroup';
import { Button, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconCancel,
    IconDeviceFloppy,
    IconHeadphones,
    IconMusic,
    IconPiano,
    IconStatusChange,
    IconUser,
} from '@tabler/icons-react';
import { IArtistModel } from '@/infrastructure/models/ArtistModel';
import {
    createArtistAction,
    getArtistsAction,
} from '@/infrastructure/adapters/artists/artists-actions';
import AsyncAutocomplete from '@/presentation/components/forms/AsyncAutocomplete';
import { formConfig } from './formConfig';
import CommonCombobox from '@/presentation/components/forms/CommonCombobox';
import { songKeyOptions } from './formValues';
import { getRythmsAction } from '@/infrastructure/adapters/rythms/rythms-actions';
import { IRythmModel } from '@/infrastructure/models/RythmModel';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { postSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import { getChordsFromText, insertAtIndex } from '@/utils/text-utils';

interface ICSInput {
    label: string;
    placeholder: string;
}
interface ICreateSongFormProps {
    i18n: {
        title: ICSInput;
        artist: ICSInput;
        key: ICSInput;
        genre: ICSInput;
        bpm: ICSInput;
        lyrics: ICSInput;
        save: string;
        cancel: string;
    };
    forkedFrom?: string;
}

const CreateSongForm = ({ forkedFrom, i18n }: ICreateSongFormProps) => {
    const form = useForm(formConfig);
    const [artistList, setArtistList] = useState<IArtistModel[]>([]);
    const [rythmList, setRythmList] = useState<IRythmModel[]>([]);
    const [chordsToInsert, setChordsToInsert] = useState<string[]>([]);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const getArtistList = async (value: string) => {
        const artistLoadingKey = 'artistListLoading';
        if (value.length < 3) {
            setArtistList([]);
            return;
        }
        setValue(true, artistLoadingKey);

        const res = await getArtistsAction(value, 10, 0);
        if (!res?.success || !res?.data) {
            setArtistList([]);
            return;
        }
        setValue(false, artistLoadingKey);
        setArtistList(res.data.artists);
    };

    const getRythmsList = async (value: string) => {
        const rythmLoadingKey = 'rythmListLoading';
        if (value.length < 2) {
            setRythmList([]);
            return;
        }
        setValue(false, rythmLoadingKey);
        const data = await getRythmsAction(value);
        if (!data) {
            setRythmList([]);
            return;
        }
        setValue(false, rythmLoadingKey);
        setRythmList(data);
    };

    const setValue = (value: string | boolean, key: string) => {
        form.setFieldValue(key, value);
    };

    const onLyricsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const text = e.currentTarget.value;
        const chords = getChordsFromText(text) || [];
        console.log(chords);
        if (JSON.stringify(chordsToInsert) !== JSON.stringify(chords)) {
            setChordsToInsert(chords);
        }
        form.setFieldValue('lyrics', text);
    };

    const insertChord = (chord: string) => {
        if (!textAreaRef.current) return;

        const cursorPosition = textAreaRef.current.selectionStart;
        const newText = insertAtIndex(form.values.lyrics, chord, cursorPosition);
        form.setFieldValue('lyrics', newText);
    };

    const submitForm = async () => {
        form.validate();
        if (!form.isValid()) {
            return;
        }
        const songData: ICreateSongViewModel = {
            title: form.values.name,
            key: form.values.key,
            artist: form.values.artist,
            forkOf: forkedFrom,
            genre: form.values.genre,
            bpm: form.values.bpm ? Number.parseInt(form.values.bpm, 10) : 0,
            lyrics: form.values.lyrics || '',
            sampleUri: undefined,
        };
        const submitFormResponse = await postSongAction(songData);
        if (!submitFormResponse.success || !submitFormResponse?.data) {
            alert('Failed to submit the form');
        } else {
            form.reset();
            location.href = `/lyrics/${submitFormResponse.data.slug}`;
        }
    };

    return (
        <form className='form-container'>
            <FormGroup>
                <TextInput
                    className='input-background'
                    label={
                        <div className='flex items-center gap-2'>
                            <IconHeadphones size={15} /> {i18n.title.label}*
                        </div>
                    }
                    id='name'
                    type='text'
                    placeholder={i18n.title.placeholder}
                    {...form.getInputProps('name')}
                />
            </FormGroup>
            <FormGroup>
                <AsyncAutocomplete
                    className='input-background'
                    label={
                        <div className='flex items-center gap-2'>
                            <IconUser size={15} /> {i18n.artist.label}*
                        </div>
                    }
                    id='artist'
                    type='text'
                    setValue={(newValue: string) => setValue(newValue, 'artist')}
                    fetchData={getArtistList}
                    i18n={i18n.artist}
                    data={artistList.map((item: IArtistModel) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                    value={form.values.artist}
                    loading={form.values.artistListLoading}
                    error={form.getInputProps('artist').error}
                    dynamicCreate={{
                        format: 'name',
                        createAction: createArtistAction,
                        property: 'artist',
                    }}
                />
                <CommonCombobox
                    options={songKeyOptions}
                    value={form.values.key}
                    setValue={(value: string) => setValue(value, 'key')}
                    className='input-background'
                    placeholder={i18n.key.placeholder}
                    label={
                        <div className='flex items-center gap-2'>
                            <IconMusic size={15} /> {i18n.key.label}
                        </div>
                    }
                    id='key'
                />
                <AsyncAutocomplete
                    className='input-background'
                    label={
                        <div className='flex items-center gap-2'>
                            <IconPiano size={15} /> {i18n.genre.label}
                        </div>
                    }
                    id='genre'
                    type='text'
                    i18n={i18n.genre}
                    setValue={(newValue: string) => setValue(newValue, 'genre')}
                    fetchData={getRythmsList}
                    data={rythmList.map((item: IRythmModel) => ({
                        value: item.id,
                        label: item.name,
                        imageUrl: item.imageUrl,
                    }))}
                    value={form.values.genre}
                    loading={form.values.genreListLoading}
                />
                <TextInput
                    className='input-background'
                    label={
                        <div className='flex items-center gap-2'>
                            <IconStatusChange size={15} /> {i18n.bpm.label}
                        </div>
                    }
                    id='bpm'
                    type='number'
                    placeholder={i18n.bpm.placeholder}
                />
            </FormGroup>
            <FormGroup>
                {chordsToInsert.map(c => (
                    <Button key={c} onClick={() => insertChord(c)}>
                        {c}
                    </Button>
                ))}
            </FormGroup>
            <FormGroup>
                <Textarea
                    ref={textAreaRef}
                    className=' input-background lyrics-textarea'
                    placeholder={i18n.lyrics.placeholder}
                    {...form.getInputProps('lyrics')}
                    onChange={onLyricsChange}></Textarea>
            </FormGroup>
            <FormGroup>
                <Button
                    size='lg'
                    radius='xl'
                    variant='gradient'
                    leftSection={<IconCancel size={20} />}
                    gradient={{ from: 'red', to: 'magenta', deg: 161 }}>
                    {i18n.cancel}
                </Button>
                <Button
                    variant='gradient'
                    gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                    size='lg'
                    leftSection={<IconDeviceFloppy size={20} />}
                    onClick={submitForm}
                    radius='xl'>
                    {i18n.save}
                </Button>
            </FormGroup>
        </form>
    );
};

export default CreateSongForm;
