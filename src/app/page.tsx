import Image from 'next/image';
import '../presentation/styles/pages/main.sass';
import MusikSearchBar from '../presentation/components/forms/MusikSearchbar/MusikSearchBar';
import { getI18n } from '@/i18n/dictionaries';
import { headers } from 'next/headers';

export default async function Home() {
    const { main } = (await getI18n(headers)) ?? {};
    return (
        <div className='main-container'>
            <Image src='/resources/musik-logo1.png' alt='Musik logo' width={150} height={150} />
            <MusikSearchBar i18n={main} />
            <div>Artist Section</div>
            <div>Ad banner</div>
        </div>
    );
}
