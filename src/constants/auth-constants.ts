const fallbackRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? 'http://localhost:3000';

export const getCurrentBaseOrigin = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return fallbackRedirectUri;
};

export const authConstants = {
    sessionCookieKey: 'session-cookie',
    getGoogleLoginUrl: (clientId: string, baseOrigin?: string) => {
        const origin = baseOrigin || getCurrentBaseOrigin();
        const redirectUri = encodeURIComponent(`${origin}/auth/google/callback`);
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    },
};
