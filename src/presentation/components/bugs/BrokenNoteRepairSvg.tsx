'use client';

import React from 'react';

export const BrokenNoteRepairSvg: React.FC<{ size?: number }> = ({ size = 160 }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <svg
                width={size}
                height={size}
                viewBox='0 0 200 200'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-label='Broken musical note repairing animation'>
                <defs>
                    <radialGradient id='noteRepairGlow' cx='50%' cy='50%' r='50%'>
                        <stop offset='0%' stopColor='#ef4444' stopOpacity='0.35'>
                            <animate
                                attributeName='stop-color'
                                values='#ef4444;#f59e0b;#10b981;#ef4444'
                                dur='2.6s'
                                repeatCount='indefinite'
                            />
                        </stop>
                        <stop offset='100%' stopColor='#0f172a' stopOpacity='0' />
                    </radialGradient>
                    <linearGradient id='noteStemGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stopColor='#f43f5e'>
                            <animate
                                attributeName='stop-color'
                                values='#f43f5e;#8b5cf6;#10b981;#f43f5e'
                                dur='2.6s'
                                repeatCount='indefinite'
                            />
                        </stop>
                        <stop offset='100%' stopColor='#ec4899'>
                            <animate
                                attributeName='stop-color'
                                values='#ec4899;#6366f1;#34d399;#ec4899'
                                dur='2.6s'
                                repeatCount='indefinite'
                            />
                        </stop>
                    </linearGradient>
                </defs>

                {/* Ambient pulsing background circle */}
                <circle cx='100' cy='100' r='82' fill='url(#noteRepairGlow)'>
                    <animate
                        attributeName='r'
                        values='74;86;74'
                        dur='2.6s'
                        repeatCount='indefinite'
                    />
                </circle>

                {/* Bottom half of musical note (Note head + lower stem) */}
                <g>
                    <animateTransform
                        attributeName='transform'
                        type='translate'
                        values='-14 12; 0 0; 0 0; -14 12'
                        keyTimes='0; 0.45; 0.78; 1'
                        dur='2.6s'
                        repeatCount='indefinite'
                    />
                    <animateTransform
                        attributeName='transform'
                        type='rotate'
                        values='-12 85 135; 0 85 135; 0 85 135; -12 85 135'
                        keyTimes='0; 0.45; 0.78; 1'
                        dur='2.6s'
                        additive='sum'
                        repeatCount='indefinite'
                    />
                    {/* Note Head */}
                    <ellipse
                        cx='78'
                        cy='142'
                        rx='24'
                        ry='17'
                        transform='rotate(-20 78 142)'
                        fill='url(#noteStemGrad)'
                    />
                    {/* Lower part of stem up to jagged fracture */}
                    <path
                        d='M93 136 L93 98 L101 103 L105 95 L105 136 Z'
                        fill='url(#noteStemGrad)'
                    />
                </g>

                {/* Top half of musical note (Upper stem + flag) */}
                <g>
                    <animateTransform
                        attributeName='transform'
                        type='translate'
                        values='16 -14; 0 0; 0 0; 16 -14'
                        keyTimes='0; 0.45; 0.78; 1'
                        dur='2.6s'
                        repeatCount='indefinite'
                    />
                    <animateTransform
                        attributeName='transform'
                        type='rotate'
                        values='15 105 65; 0 105 65; 0 105 65; 15 105 65'
                        keyTimes='0; 0.45; 0.78; 1'
                        dur='2.6s'
                        additive='sum'
                        repeatCount='indefinite'
                    />
                    {/* Upper stem from jagged fracture to top */}
                    <path
                        d='M93 98 L101 103 L105 95 L105 42 L93 42 Z'
                        fill='url(#noteStemGrad)'
                    />
                    {/* Musical Flag */}
                    <path
                        d='M105 42 C125 46, 146 60, 142 88 C139 72, 122 62, 105 60 Z'
                        fill='url(#noteStemGrad)'
                    />
                </g>

                {/* Fracture / Repair Sparkles */}
                <g>
                    <animate
                        attributeName='opacity'
                        values='0; 1; 1; 0'
                        keyTimes='0; 0.42; 0.72; 1'
                        dur='2.6s'
                        repeatCount='indefinite'
                    />
                    {/* Healing ring around weld point */}
                    <circle
                        cx='99'
                        cy='99'
                        r='16'
                        stroke='#34d399'
                        strokeWidth='2.5'
                        strokeDasharray='6 4'
                        fill='none'>
                        <animate
                            attributeName='r'
                            values='8; 26; 32'
                            dur='1.3s'
                            repeatCount='indefinite'
                        />
                    </circle>
                    {/* Spark stars */}
                    <path
                        d='M68 92 L74 95 L68 98 L65 104 L62 98 L56 95 L62 92 L65 86 Z'
                        fill='#fbbf24'
                    />
                    <path
                        d='M132 96 L137 98 L132 100 L130 105 L128 100 L123 98 L128 96 L130 91 Z'
                        fill='#34d399'
                    />
                </g>
            </svg>
        </div>
    );
};
