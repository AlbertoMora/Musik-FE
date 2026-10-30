'use server';
import { setSessionCookie } from '@/infrastructure/adapters/auth/auth-actions';
import { AuthAdapterFromMicro } from '@/infrastructure/adapters/auth/auth-adapter-from-micro';
import { commonsConstants } from '@/constants/commons-constants';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
    const {
        code,
        redirectUri,
        deviceId,
        rsaPubKey,
        deviceName,
        deviceBrand,
        deviceModel,
        deviceType,
        clientIp,
    } = await req.json();
    const userAgent = req.headers.get('user-agent') ?? commonsConstants.unknown;

    const originHeader = req.headers.get('origin');
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protoHeader = req.headers.get('x-forwarded-proto') || 'http';
    const inferredOrigin =
        originHeader || (hostHeader ? `${protoHeader}://${hostHeader}` : 'http://localhost:3000');
    const resolvedRedirectUri = redirectUri || `${inferredOrigin}/auth/google/callback`;

    const authAdapter = new AuthAdapterFromMicro();
    const serviceRes = await authAdapter.checkGoogleSession(
        code,
        userAgent,
        {
            deviceId,
            rsaPubKey,
            deviceName,
            deviceBrand,
            deviceModel,
            deviceType,
            clientIp,
        },
        resolvedRedirectUri,
    );

    if (!serviceRes.success || !serviceRes.data?.accessToken)
        return NextResponse.json(
            { status: `Service Error: ${serviceRes.reason}` },
            { status: 500 },
        );

    await setSessionCookie(serviceRes.data);

    return NextResponse.json({ status: serviceRes.data.status });
};
