import React, { useContext } from 'react';
import { UploadFormStoreContext } from './uploadFormStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Slider, Text } from '@mantine/core';

interface UploadSampleFormLoadingProps {
    i18n: I18nTypes['lyrics']['text']['uploadModal'];
    cancelProcessAction: () => void;
}

const UPLOADING_LOTTIE_URI = '/resources/lottie-animations/loading/SonnetiaUploadingAnimation.json';

const MusicalUploadSuccessIllustration = () => (
    <svg
        className="song-not-found-svg"
        viewBox="0 0 320 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 320, height: 185 }}
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="musOkGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="musOkVinyl" x1="95" y1="30" x2="225" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="musOkCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="musOkWave" x1="20" y1="95" x2="300" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                <stop offset="25%" stopColor="#34d399" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#a78bfa" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Ambient emerald/violet glow */}
        <circle cx="160" cy="95" r="88" fill="url(#musOkGlow)" />

        {/* Equalizer soundwave bars left & right */}
        <g opacity="0.85">
            <rect x="42" y="82" width="5" height="26" rx="2.5" fill="#34d399" />
            <rect x="54" y="68" width="5" height="54" rx="2.5" fill="#10b981" />
            <rect x="66" y="76" width="5" height="38" rx="2.5" fill="#a78bfa" />
            <rect x="78" y="60" width="5" height="70" rx="2.5" fill="#34d399" />

            <rect x="237" y="60" width="5" height="70" rx="2.5" fill="#34d399" />
            <rect x="249" y="76" width="5" height="38" rx="2.5" fill="#a78bfa" />
            <rect x="261" y="68" width="5" height="54" rx="2.5" fill="#10b981" />
            <rect x="273" y="82" width="5" height="26" rx="2.5" fill="#34d399" />
        </g>

        {/* Harmonic wave path */}
        <path
            d="M20 95 Q 90 60, 160 95 T 300 95"
            stroke="url(#musOkWave)"
            strokeWidth="2"
            strokeDasharray="5 4"
        />

        {/* Vinyl Record */}
        <circle
            cx="160"
            cy="95"
            r="60"
            fill="url(#musOkVinyl)"
            stroke="#34d399"
            strokeWidth="2.4"
        />
        <circle cx="160" cy="95" r="48" stroke="#6ee7b7" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="10 6" />
        <circle cx="160" cy="95" r="36" stroke="#a78bfa" strokeOpacity="0.32" strokeWidth="1.2" strokeDasharray="8 5" />

        {/* Center Emerald Badge with Checkmark */}
        <circle cx="160" cy="95" r="24" fill="url(#musOkCenter)" />
        <path
            d="M149 95.5 L156.5 103 L172 87.5"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Floating Musical Notes */}
        <g className="song-not-found-svg-float-left">
            <path
                d="M72 44 V22 L88 18 V40"
                stroke="#6ee7b7"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <ellipse cx="68" cy="45" rx="5" ry="3.8" transform="rotate(-18 68 45)" fill="#6ee7b7" />
            <ellipse cx="84" cy="41" rx="5" ry="3.8" transform="rotate(-18 84 41)" fill="#6ee7b7" />
        </g>

        <g className="song-not-found-svg-float-right">
            <path
                d="M244 46 V24 L256 28"
                stroke="#c4b5fd"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <ellipse cx="240" cy="47" rx="5" ry="3.8" transform="rotate(-18 240 47)" fill="#c4b5fd" />
        </g>

        {/* Sparkles */}
        <circle cx="104" cy="36" r="3" fill="#34d399" />
        <circle cx="218" cy="148" r="3.5" fill="#6ee7b7" />
        <circle cx="96" cy="146" r="2.5" fill="#a78bfa" />
    </svg>
);

const MusicalUploadErrorIllustration = () => (
    <svg
        className="song-not-found-svg"
        viewBox="0 0 320 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 320, height: 185 }}
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="musErrGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="musErrBody" x1="100" y1="30" x2="220" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="musErrCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
        </defs>

        {/* Ambient crimson glow */}
        <circle cx="160" cy="95" r="88" fill="url(#musErrGlow)" />

        {/* Unplugged / snapped audio jack cable on left & right */}
        <path
            d="M28 112 C56 112, 68 95, 92 95"
            stroke="#fb7185"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 4"
        />
        <path
            d="M228 95 C252 95, 264 78, 292 78"
            stroke="#fb7185"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 4"
        />

        {/* Flatlined / broken equalizer bars */}
        <g opacity="0.75">
            <rect x="46" y="88" width="5" height="14" rx="2.5" fill="#f43f5e" />
            <rect x="58" y="91" width="5" height="8" rx="2.5" fill="#fb7185" />
            <rect x="70" y="85" width="5" height="20" rx="2.5" fill="#f43f5e" />

            <rect x="245" y="85" width="5" height="20" rx="2.5" fill="#f43f5e" />
            <rect x="257" y="91" width="5" height="8" rx="2.5" fill="#fb7185" />
            <rect x="269" y="88" width="5" height="14" rx="2.5" fill="#f43f5e" />
        </g>

        {/* Cracked Studio Disc / Speaker Cone */}
        <circle
            cx="160"
            cy="95"
            r="60"
            fill="url(#musErrBody)"
            stroke="#f43f5e"
            strokeWidth="2.4"
        />
        <circle cx="160" cy="95" r="46" stroke="#fda4af" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="7 6" />

        {/* Lightning crack across the disc */}
        <path
            d="M122 48 L142 74 L133 82 L185 116 L176 125 L196 144"
            stroke="#fda4af"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Center Crimson Badge with X */}
        <circle cx="160" cy="95" r="24" fill="url(#musErrCenter)" />
        <path
            d="M151 86 L169 104 M169 86 L151 104"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
        />

        {/* Floating Broken / Muted Note */}
        <g className="song-not-found-svg-float-left">
            <path
                d="M78 46 V24 L92 28"
                stroke="#fda4af"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <ellipse cx="74" cy="47" rx="5" ry="3.8" transform="rotate(-18 74 47)" fill="#fda4af" />
            <line x1="66" y1="22" x2="94" y2="50" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* Electric error sparks */}
        <g className="song-not-found-svg-float-right">
            <path
                d="M234 36 L242 28 M244 44 L254 40 M230 48 L238 54"
                stroke="#fbbf24"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
        </g>
    </svg>
);

const UploadSampleFormLoading = ({ i18n, cancelProcessAction }: UploadSampleFormLoadingProps) => {
    const { isProcessFinished, isSuccess, uploadProgress } =
        useContext(UploadFormStoreContext) || {};

    return (
        <div className="loading-container">
            {!isProcessFinished ? (
                <>
                    <DotLottieReact
                        key="uploading"
                        src={UPLOADING_LOTTIE_URI}
                        autoplay
                        loop
                        style={{ width: 'min(100%, 668px)', height: 209 }}
                    />
                    <Text className="mt-3">{i18n.uploadProcess.uploading}</Text>
                    <Slider
                        value={uploadProgress}
                        max={100}
                        thumbChildren={null}
                        classNames={{
                            root: 'loading-bar',
                            track: 'loading-bar-track',
                            bar: 'loading-bar-content',
                            thumb: 'loading-bar-no-thumb',
                        }}
                    />
                    <Button onClick={cancelProcessAction} className="mt-3" type="button">
                        {i18n.cancelButton}
                    </Button>
                </>
            ) : (
                <>
                    {isSuccess ? (
                        <MusicalUploadSuccessIllustration />
                    ) : (
                        <MusicalUploadErrorIllustration />
                    )}
                    <Text fw={600} mt="xs">
                        {isSuccess ? i18n.uploadProcess.ok : i18n.uploadProcess.clientErr}
                    </Text>
                </>
            )}
        </div>
    );
};

export default UploadSampleFormLoading;
