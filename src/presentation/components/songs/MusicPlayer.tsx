import { I18nTypes } from '@/i18n/dictionaries';
import { ActionIcon, Group, Slider, Text } from '@mantine/core';
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerStop,
    IconRewindBackward10,
    IconRewindForward10,
} from '@tabler/icons-react';

import React, { useEffect, useRef, useState } from 'react';
import '@/presentation/styles/components/music-player.sass';

interface IMusicPlayerProps {
    url?: string;
    i18n: I18nTypes['lyrics']['text']['musicPlayer'];
}

const MusicPlayer = ({ i18n, url }: IMusicPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // URL de un audio de ejemplo (puedes reemplazarlo)
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', updateTime);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', updateTime);
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const stopAudio = () => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
    };

    const seekForward = () => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }
        audio.currentTime = Math.min(audio.currentTime + 10, duration);
    };

    const seekBackward = () => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    return url ? (
        <div>MusicPlayer</div>
    ) : (
        <div className='music-player-container'>
            <div className='music-player-no-player'>{i18n.noUrl}</div>
            {url && (
                <audio ref={audioRef} src={audioUrl}>
                    <track
                        kind='captions'
                        src='' // Puedes añadir un archivo .vtt aquí si tienes subtítulos
                        label='Sample Music Player'
                        default
                    />
                </audio>
            )}
            {/* Controles */}
            <div className='flex justify-center items-center gap-3'>
                <ActionIcon
                    size='sm'
                    variant='light'
                    onClick={seekBackward}
                    title={i18n.tenSecondsBackward}>
                    <IconRewindBackward10 size={15} />
                </ActionIcon>
                <div className='flex gap-1 mb-3 relative'>
                    <ActionIcon
                        size='xl'
                        variant='filled'
                        radius='xl'
                        color='blue'
                        onClick={togglePlayPause}
                        title={isPlaying ? i18n.pause : i18n.play}>
                        {isPlaying ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                    </ActionIcon>

                    <ActionIcon
                        size='sm'
                        variant='light'
                        className='music-player-stop-bottom'
                        onClick={stopAudio}
                        title={i18n.stop}>
                        <IconPlayerStop size={20} />
                    </ActionIcon>
                </div>
                <ActionIcon
                    size='sm'
                    variant='light'
                    onClick={seekForward}
                    title={i18n.tenSecondsForward}>
                    <IconRewindForward10 size={15} />
                </ActionIcon>
            </div>
            {/* Barra de progreso */}
            <div className='flex flex-col flex-1 pt-5 justify-center items-stretch'>
                <Slider
                    value={currentTime}
                    onChange={value => {
                        if (!audioRef?.current) {
                            return;
                        }
                        audioRef.current.currentTime = value;
                        setCurrentTime(value);
                    }}
                    max={duration}
                    label={formatTime(currentTime)}
                    styles={{ thumb: { transition: 'none' } }}
                />
                <Group className='flex self-center'>
                    <Text size='xs'>{formatTime(currentTime)}</Text>/
                    <Text size='xs'>{formatTime(duration)}</Text>
                </Group>
            </div>
        </div>
    );
};

export default MusicPlayer;
