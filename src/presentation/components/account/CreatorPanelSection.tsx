'use client';

import React from 'react';
import { IconStar } from '@tabler/icons-react';
import { AccountPageI18n } from './account.types';

interface ICreatorPanelSectionProps {
    i18n: AccountPageI18n;
}

const CreatorPanelSection = ({ i18n }: ICreatorPanelSectionProps) => {
    return (
        <article className='panelCard'>
            <div className='panelHeader'>
                <div className='panelHeaderTitleGroup'>
                    <IconStar size={20} />
                    <div>
                        <h2>{i18n.sections.creatorPanel.title}</h2>
                        <p>{i18n.sections.creatorPanel.subtitle}</p>
                    </div>
                </div>
            </div>
            <div className='creatorGrid'>
                <div className='creatorStat'>
                    <span>{i18n.sections.creatorPanel.cards.createdSongsViewed}</span>
                    <strong>2,490</strong>
                </div>
                <div className='creatorStat'>
                    <span>{i18n.sections.creatorPanel.cards.moneyEarned}</span>
                    <strong>$1,240</strong>
                </div>
                <div className='creatorStat'>
                    <span>{i18n.sections.creatorPanel.cards.publishedSongs}</span>
                    <strong>18</strong>
                </div>
                <div className='creatorStat'>
                    <span>{i18n.sections.creatorPanel.cards.draftsReady}</span>
                    <strong>7</strong>
                </div>
            </div>
        </article>
    );
};

export default CreatorPanelSection;
