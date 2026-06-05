import DefaultNavbar from '@/presentation/components/layout/navbar/DefaultNavbar';
import Footer from '@/presentation/components/layout/footer/Footer';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '../presentation/styles/components/footer.sass';
import '../presentation/styles/common/global.sass';

import { createTheme, MantineProvider } from '@mantine/core';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import { isSessionActive } from '@/infrastructure/adapters/auth/auth-actions';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
    /** Put your mantine theme override here */
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {
        app: { navbar, footer },
    } = (await getI18n(headers)) ?? {};

    const isLogged = await isSessionActive();
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <meta charSet='UTF-8'></meta>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'></meta>
                <link rel='shortcut icon' href='/resources/musik-logo1.png' type='image/x-icon' />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){var s=localStorage.getItem('theme');if(s==='light'||(!s&&typeof window!=='undefined'&&window.matchMedia('(prefers-color-scheme:light)').matches)){document.documentElement.dataset.theme='light';}else{document.documentElement.dataset.theme='dark';}})();`,
                    }}
                />
            </head>
            <body>
                <MantineProvider theme={theme}>
                    <Notifications />
                    <DefaultNavbar i18n={navbar} isLogged={!!isLogged} />
                    <div className='app-shell-content'>{children}</div>
                    <Footer i18n={footer} />
                </MantineProvider>
            </body>
        </html>
    );
}
