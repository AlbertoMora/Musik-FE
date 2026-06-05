import Image from 'next/image';
import '../presentation/styles/pages/main.sass';
import MusikSearchBar from '../presentation/components/forms/MusikSearchbar/MusikSearchBar';
import { getI18n } from '@/i18n/dictionaries';
import { headers } from 'next/headers';
import ArtistSection from '@/presentation/components/mainPage/ArtistSection';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { main } = (await getI18n(headers)) ?? {};

    return {
        title: main?.head?.title,
        description: main?.head?.description,
    };
}

export default async function Home() {
    const { main } = (await getI18n(headers)) ?? {};

    return (
        <div className='main-container'>
            <Image src='/resources/musik-logo1.png' alt='Musik logo' width={150} height={150} />
            <MusikSearchBar i18n={main} />
            <ArtistSection />
            <div>Ad banner</div>
        </div>
    );
}
