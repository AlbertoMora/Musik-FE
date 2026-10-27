'use client';

import React from 'react';
import { Pagination, Skeleton } from '@mantine/core';
import { IconChartAreaLine, IconChevronRight, IconMusic } from '@tabler/icons-react';
import moment from 'moment';
import { ISongHistoryItemDTO } from '@/domain/songs/song-gateway';
import { AccountPageI18n } from './account.types';

interface IStatisticsSectionProps {
    statsSummary: {
        sitesVisited: number;
        historyRecords: number;
        lastVisit: string | null;
    };
    historyItems: ISongHistoryItemDTO[];
    historyTotalCount: number;
    historyPage: number;
    pageSize: number;
    isHistoryLoading: boolean;
    onPageChange: (page: number) => void;
    i18n: AccountPageI18n;
}

const StatisticsSection = ({
    statsSummary,
    historyItems,
    historyTotalCount,
    historyPage,
    pageSize,
    isHistoryLoading,
    onPageChange,
    i18n,
}: IStatisticsSectionProps) => {
    const totalPages = Math.max(1, Math.ceil(historyTotalCount / pageSize));
    const formattedLastVisit = statsSummary.lastVisit
        ? moment(statsSummary.lastVisit).isSame(moment(), 'day')
            ? `${i18n.common.today}, ${moment(statsSummary.lastVisit).format('HH:mm')}`
            : moment(statsSummary.lastVisit).format('DD/MM/YYYY HH:mm')
        : i18n.common.notAvailable;

    return (
        <article className='panelCard'>
            <div className='panelHeader'>
                <div className='panelHeaderTitleGroup'>
                    <IconChartAreaLine size={20} />
                    <div>
                        <h2>{i18n.sections.statistics.title}</h2>
                        <p>{i18n.sections.statistics.subtitle}</p>
                    </div>
                </div>
            </div>
            <div className='metricsRow'>
                <div className='metricCard'>
                    <span>{i18n.sections.statistics.cards.sitesVisited}</span>
                    <strong>{statsSummary.sitesVisited}</strong>
                </div>
                <div className='metricCard'>
                    <span>{i18n.sections.statistics.cards.historyRecords}</span>
                    <strong>{statsSummary.historyRecords}</strong>
                </div>
                <div className='metricCard'>
                    <span>{i18n.sections.statistics.cards.lastVisit}</span>
                    <strong>{formattedLastVisit}</strong>
                </div>
            </div>

            <div className='historySection'>
                <h3>{i18n.sections.statistics.history.title}</h3>
                {isHistoryLoading ? (
                    <div className='historyList'>
                        <Skeleton height={62} radius='lg' />
                        <Skeleton height={62} radius='lg' />
                        <Skeleton height={62} radius='lg' />
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className='historyEmpty'>{i18n.sections.statistics.history.empty}</div>
                ) : (
                    <>
                        <div className='historyList'>
                            {historyItems.map(item => (
                                <a
                                    key={item.id}
                                    href={`/lyrics/${item.slug}`}
                                    className='historyItem'>
                                    <div className='historyItemMain'>
                                        <span className='historyItemIcon'>
                                            <IconMusic size={18} />
                                        </span>
                                        <div className='historyItemText'>
                                            <strong>{item.songName}</strong>
                                            <small>
                                                {i18n.sections.statistics.history.artistLabel}:{' '}
                                                {item.artistName}
                                            </small>
                                        </div>
                                    </div>
                                    <div className='historyItemMeta'>
                                        {item.songKey && (
                                            <span className='historyKeyBadge'>{item.songKey}</span>
                                        )}
                                        <span className='historyTimeText'>
                                            {item.viewedAt
                                                ? moment(item.viewedAt).format('DD/MM/YYYY HH:mm')
                                                : ''}
                                        </span>
                                        <IconChevronRight size={16} />
                                    </div>
                                </a>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className='historyPagination'>
                                <Pagination
                                    total={totalPages}
                                    value={historyPage}
                                    onChange={onPageChange}
                                    radius='xl'
                                    color='indigo'
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </article>
    );
};

export default StatisticsSection;
