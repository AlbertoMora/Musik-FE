'use server';
import { setSessionCookie } from '@/infrastructure/adapters/auth/auth-actions';
import { AuthAdapterFromMicro } from '@/infrastructure/adapters/auth/auth-adapter-from-micro';

import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
    const { code } = await req.json();

    const authAdapter = new AuthAdapterFromMicro();
    const serviceRes = await authAdapter.checkGoogleSession(code);

    if (!serviceRes.success || !serviceRes.data?.accessToken)
        return NextResponse.json(
            { status: `Service Error: ${serviceRes.reason}` },
            { status: 500 }
        );

    await setSessionCookie(serviceRes.data);

    return NextResponse.json({ status: serviceRes.data.status });
};
