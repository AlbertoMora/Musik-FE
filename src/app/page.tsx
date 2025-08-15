import Image from 'next/image';
import '../presentation/styles/pages/main.sass';
import MusikSearchBar from '../presentation/components/forms/MusikSearchbar/MusikSearchBar';

export default function Home() {
    return (
        <div className='main-container'>
            <Image src='/resources/musik-logo1.png' alt='Musik logo' width={150} height={150} />
            <MusikSearchBar />
            <div>Artist Section</div>
            <div>Ad banner</div>
        </div>
    );
}
