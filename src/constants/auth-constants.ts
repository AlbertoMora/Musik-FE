const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? 'http://localhost:3000';

export const authConstants = {
    sessionCookieKey: 'session-cookie',
    getGoogleLoginUrl: (clientId: string) =>
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${
            googleRedirectUri + '/auth/google/callback'
        }&response_type=code&scope=openid%20email%20profile`,
};
