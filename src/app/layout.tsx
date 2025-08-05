import DefaultNavbar from '@/presentation/components/layout/navbar/DefaultNavbar';
import '@mantine/core/styles.css';
import './globals.css';
import '../presentation/styles/common/global.sass';

import { createTheme, MantineProvider } from '@mantine/core';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import { isSessionActive } from '@/infrastructure/adapters/auth/auth-actions';

const theme = createTheme({
    /** Put your mantine theme override here */
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {
        app: { navbar },
    } = (await getI18n(headers)) ?? {};

    const isLogged = await isSessionActive();
    return (
        <html lang='en' suppressHydrationWarning>
            <head></head>
            <body>
                <MantineProvider theme={theme}>
                    <DefaultNavbar i18n={navbar} isLogged={!!isLogged} />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
