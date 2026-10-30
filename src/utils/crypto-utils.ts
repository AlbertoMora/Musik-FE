const devicePK = 'device-pk';
const devicePbK = 'device-pbk';
const devicePKJwk = 'device-pk-jwk';
const devicePbKSpki = 'device-pbk-spki';
const deviceIdKey = 'device-id';
const algorithmConfig = {
    name: 'ECDSA',
    namedCurve: 'P-256',
};
import { v4 as uuid } from 'uuid';

export interface IClientDeviceMetadata {
    deviceId: string;
    rsaPubKey: string;
    deviceName: string;
    deviceBrand: string;
    deviceModel: string;
    deviceType: string;
    clientIp?: string;
}

const PUBLIC_IP_CACHE_KEY = 'cached-public-ip';

export const getClientPublicIp = async (): Promise<string | undefined> => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            const cached = window.sessionStorage.getItem(PUBLIC_IP_CACHE_KEY);
            if (cached) return cached;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        const res = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = (await res.json()) as { ip?: string };
            if (data?.ip) {
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    window.sessionStorage.setItem(PUBLIC_IP_CACHE_KEY, data.ip);
                }
                return data.ip;
            }
        }
    } catch {
        // Fallback silently if offline or blocked by adblocker
    }
    return undefined;
};

const isSubtleCryptoAvailable = () =>
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined';

const getStorageFallback = (key: string): string | null => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(`sonnetia_${key}`);
        }
    } catch {
        // Ignore storage quota or private mode errors
    }
    return null;
};

const setStorageFallback = (key: string, value: string) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(`sonnetia_${key}`, value);
        }
    } catch {
        // Ignore storage quota or private mode errors
    }
};

export const generateKeyPair = async () => {
    if (!isSubtleCryptoAvailable()) {
        const fallbackId = await generateDeviceId();
        return { pubKey: `FALLBACK_PK_${fallbackId}`, keyPair: null };
    }

    // 1. Check serialized JWK + SPKI keys first (works across all mobile & desktop browsers)
    try {
        const storedSpki =
            (await getFromIndexedDB<string>(devicePbKSpki).catch(() => null)) ||
            getStorageFallback(devicePbKSpki);
        const storedJwkStr =
            (await getFromIndexedDB<string>(devicePKJwk).catch(() => null)) ||
            getStorageFallback(devicePKJwk);

        if (storedSpki && storedJwkStr) {
            const jwk = JSON.parse(storedJwkStr) as JsonWebKey;
            await crypto.subtle.importKey('jwk', jwk, algorithmConfig, false, ['sign']);
            return { pubKey: storedSpki, keyPair: null };
        }
    } catch {
        // Proceed to check legacy keys or generate new ones
    }

    // 2. Check legacy CryptoKey objects in IndexedDB (backward compatibility with existing desktop sessions)
    try {
        const currentPbk = await getFromIndexedDB<CryptoKey>(devicePbK);
        const currentPk = await getFromIndexedDB<CryptoKey>(devicePK);

        if (currentPbk && currentPk) {
            const pubKey64 = await getBase64PublicKey(currentPbk);
            return { pubKey: pubKey64, keyPair: null };
        }
    } catch {
        // Proceed to generate a new extractable key pair
    }

    // 3. Generate extractable keyPair so we can serialize JWK/SPKI strings safely on mobile browsers
    try {
        const keyPair = await crypto.subtle.generateKey(algorithmConfig, true, ['sign', 'verify']);
        const pubKey64 = await getBase64PublicKey(keyPair.publicKey);
        const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
        const privJwkStr = JSON.stringify(privJwk);

        setStorageFallback(devicePbKSpki, pubKey64);
        setStorageFallback(devicePKJwk, privJwkStr);

        await saveToDB(pubKey64, devicePbKSpki).catch(() => null);
        await saveToDB(privJwkStr, devicePKJwk).catch(() => null);
        await saveToDB(keyPair.privateKey, devicePK).catch(() => null);
        await saveToDB(keyPair.publicKey, devicePbK).catch(() => null);

        return { pubKey: pubKey64, keyPair };
    } catch {
        const fallbackId = await generateDeviceId();
        return { pubKey: `FALLBACK_PK_${fallbackId}`, keyPair: null };
    }
};

const getBase64PublicKey = async (publicKey: CryptoKey) => {
    const pubKey = await crypto.subtle.exportKey('spki', publicKey);
    const bytes = new Uint8Array(pubKey);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

export const signValue = async (value: string) => {
    if (!isSubtleCryptoAvailable()) {
        const fallbackId = await generateDeviceId();
        return btoa(`FALLBACK_SIG:${fallbackId}:${value}`);
    }

    const encoder = new TextEncoder();
    let privateKey: CryptoKey | null = null;

    // 1. Try serialized JWK first (reliable on mobile browsers)
    try {
        const storedJwkStr =
            (await getFromIndexedDB<string>(devicePKJwk).catch(() => null)) ||
            getStorageFallback(devicePKJwk);
        if (storedJwkStr) {
            const jwk = JSON.parse(storedJwkStr) as JsonWebKey;
            privateKey = await crypto.subtle.importKey('jwk', jwk, algorithmConfig, false, [
                'sign',
            ]);
        }
    } catch {
        privateKey = null;
    }

    // 2. Fallback to legacy CryptoKey in IndexedDB
    if (!privateKey) {
        try {
            privateKey = await getFromIndexedDB<CryptoKey>(devicePK);
        } catch {
            privateKey = null;
        }
    }

    // 3. If still missing, generate a fresh keypair and import it
    if (!privateKey) {
        try {
            const generated = await generateKeyPair();
            if (generated.keyPair?.privateKey) {
                privateKey = generated.keyPair.privateKey;
            } else {
                const storedJwkStr = getStorageFallback(devicePKJwk);
                if (storedJwkStr) {
                    privateKey = await crypto.subtle.importKey(
                        'jwk',
                        JSON.parse(storedJwkStr) as JsonWebKey,
                        algorithmConfig,
                        false,
                        ['sign'],
                    );
                }
            }
        } catch {
            privateKey = null;
        }
    }

    if (!privateKey) {
        const fallbackId = await generateDeviceId();
        return btoa(`FALLBACK_SIG:${fallbackId}:${value}`);
    }

    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        encoder.encode(value),
    );

    const derSign = toDER(new Uint8Array(signature));
    let binary = '';
    for (let i = 0; i < derSign.byteLength; i++) {
        binary += String.fromCharCode(derSign[i]);
    }
    return btoa(binary);
};

export const generateDeviceId = async () => {
    try {
        const storedDeviceId =
            (await getFromIndexedDB<string>(deviceIdKey).catch(() => null)) ||
            getStorageFallback(deviceIdKey);
        if (storedDeviceId) {
            setStorageFallback(deviceIdKey, storedDeviceId);
            return storedDeviceId;
        }
    } catch {
        // Fallback to generating a new device ID
    }

    const deviceId = uuid();
    setStorageFallback(deviceIdKey, deviceId);
    await saveToDB<string>(deviceId, deviceIdKey).catch(() => null);
    return deviceId;
};

export const parseBrowserDeviceInfo = (userAgentString?: string) => {
    const ua =
        userAgentString ||
        (typeof navigator !== 'undefined' ? navigator.userAgent : '') ||
        'Unknown';

    let os = 'Unknown OS';
    if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
    else if (/windows nt/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9.]+)/i);
        os = match ? `Android ${match[1]}` : 'Android';
    } else if (/ipad|iphone|ipod/i.test(ua)) {
        const match = ua.match(/OS\s([0-9_]+)/i);
        os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    } else if (/mac os x|macintosh/i.test(ua)) {
        os = 'macOS';
    } else if (/cros/i.test(ua)) {
        os = 'ChromeOS';
    } else if (/linux/i.test(ua)) {
        os = 'Linux';
    }

    let browser = 'Browser';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua)) browser = 'Safari';

    const isTablet = /ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
    const isMobile = !isTablet && /mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    let deviceBrand = browser;
    let deviceModel = os;

    if (/iphone/i.test(ua)) {
        deviceBrand = 'Apple';
        deviceModel = 'iPhone';
    } else if (/ipad/i.test(ua)) {
        deviceBrand = 'Apple';
        deviceModel = 'iPad';
    } else if (/macintosh|mac os x/i.test(ua)) {
        deviceBrand = 'Apple';
        deviceModel = 'Mac';
    } else if (/samsung|sm-/i.test(ua)) {
        deviceBrand = 'Samsung';
        const match = ua.match(/(SM-[A-Z0-9]+)/i);
        deviceModel = match ? match[1] : 'Galaxy';
    } else if (/pixel/i.test(ua)) {
        deviceBrand = 'Google';
        const match = ua.match(/(Pixel\s[a-zA-Z0-9]+)/i);
        deviceModel = match ? match[1] : 'Pixel';
    } else if (/xiaomi|redmi|poco/i.test(ua)) {
        deviceBrand = 'Xiaomi';
        deviceModel = 'Android';
    } else if (/android/i.test(ua)) {
        deviceBrand = 'Android';
        const match = ua.match(/;\s*([^;)]+)\s+Build\//i);
        deviceModel = match ? match[1].trim().slice(0, 40) : 'Smartphone';
    } else if (/windows/i.test(ua)) {
        deviceBrand = 'PC';
        deviceModel = 'Windows';
    } else if (/linux/i.test(ua)) {
        deviceBrand = 'PC';
        deviceModel = 'Linux';
    }

    const deviceName = `${browser} en ${deviceModel} (${os})`;

    return {
        os,
        browser,
        deviceType,
        deviceBrand,
        deviceModel,
        deviceName,
    };
};

export const getClientDeviceInfo = async (): Promise<IClientDeviceMetadata> => {
    const [deviceId, { pubKey }, clientIp] = await Promise.all([
        generateDeviceId(),
        generateKeyPair(),
        getClientPublicIp(),
    ]);
    const info = parseBrowserDeviceInfo();
    return {
        deviceId,
        rsaPubKey: pubKey,
        deviceName: info.deviceName,
        deviceBrand: info.deviceBrand,
        deviceModel: info.deviceModel,
        deviceType: info.deviceType,
        clientIp,
    };
};

const openAuthDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('auth-db', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys');
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.close();
                const delReq = indexedDB.deleteDatabase('auth-db');
                delReq.onsuccess = () => {
                    const retryReq = indexedDB.open('auth-db', 1);
                    retryReq.onupgradeneeded = () => {
                        retryReq.result.createObjectStore('keys');
                    };
                    retryReq.onsuccess = () => resolve(retryReq.result);
                    retryReq.onerror = () =>
                        reject(new Error(retryReq.error?.message ?? 'Failed to open auth-db'));
                };
                delReq.onerror = () =>
                    reject(new Error(delReq.error?.message ?? 'Failed to reset auth-db'));
                return;
            }
            resolve(db);
        };
        request.onerror = () =>
            reject(new Error(request.error?.message ?? 'Failed to open auth-db'));
    });
};

const saveToDB = async <T>(value: T, key: string) => {
    const db = await openAuthDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('keys', 'readwrite');
        tx.objectStore('keys').put(value, key);
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = () => {
            db.close();
            reject(new Error(tx.error?.message ?? 'Transaction error'));
        };
    });
};

const getFromIndexedDB = async <T>(keyName: string): Promise<T> => {
    const db = await openAuthDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('keys', 'readonly');
        const keyRequest = tx.objectStore('keys').get(keyName);
        keyRequest.onsuccess = () => {
            db.close();
            resolve(keyRequest.result as T);
        };
        keyRequest.onerror = () => {
            db.close();
            reject(new Error(tx.error?.message ?? 'Transaction error'));
        };
    });
};

const toDER = (rawSig: Uint8Array): Uint8Array => {
    const r = rawSig.slice(0, 32);
    const s = rawSig.slice(32);

    // Remove leading zeros
    const trim = (bytes: Uint8Array) => {
        let i = 0;
        while (i < bytes.length - 1 && bytes[i] === 0) i++;
        return bytes.slice(i);
    };

    const encodeInt = (bytes: Uint8Array) => {
        const trimmed = trim(bytes);
        // If the first byte is >= 0x80, prepend a 0 to indicate positive number
        if (trimmed[0] & 0x80) {
            const result = new Uint8Array(trimmed.length + 1);
            result.set([0], 0);
            result.set(trimmed, 1);
            return result;
        }
        return trimmed;
    };

    const encodedR = encodeInt(r);
    const encodedS = encodeInt(s);

    const totalLen = 2 + encodedR.length + 2 + encodedS.length;
    const result = new Uint8Array(2 + totalLen);
    let offset = 0;

    result[offset++] = 0x30; // SEQUENCE
    result[offset++] = totalLen;

    result[offset++] = 0x02; // INTEGER
    result[offset++] = encodedR.length;
    result.set(encodedR, offset);
    offset += encodedR.length;

    result[offset++] = 0x02; // INTEGER
    result[offset++] = encodedS.length;
    result.set(encodedS, offset);

    return result;
};
