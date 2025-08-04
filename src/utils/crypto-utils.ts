const devicePK = 'device-pk';
const devicePbK = 'device-pbk';
const deviceIdKey = 'device-id';
const algorithmConfig = {
    name: 'ECDSA',
    namedCurve: 'P-256',
};
import { v4 as uuid } from 'uuid';

export const generateKeyPair = async () => {
    const currentPbk = await getFromIndexedDB<CryptoKey>(devicePbK);

    if (currentPbk) {
        const pubKey64 = await getBase64PublicKey(currentPbk);
        return { pubKey: pubKey64, keyPair: null };
    }

    const keyPair = await crypto.subtle.generateKey(algorithmConfig, false, ['sign', 'verify']);

    saveToDB(keyPair.privateKey, devicePK);
    saveToDB(keyPair.publicKey, devicePbK);

    const pubKey64 = await getBase64PublicKey(keyPair.publicKey);

    return { pubKey: pubKey64, keyPair };
};

const getBase64PublicKey = async (publicKey: CryptoKey) => {
    const pubKey = await crypto.subtle.exportKey('spki', publicKey);
    const pubKey64 = btoa(String.fromCharCode(...new Uint8Array(pubKey)));
    return pubKey64;
};

export const signValue = async (value: string) => {
    const key = await getFromIndexedDB<CryptoKey>(devicePK);
    const encoder = new TextEncoder();

    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        key,
        encoder.encode(value)
    );

    const derSign = toDER(new Uint8Array(signature));

    return btoa(String.fromCharCode(...derSign));
};

const saveToDB = <T>(value: T, key: string) => {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('auth-db', 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('keys');
        };
        request.onsuccess = () => {
            const tx = request.result.transaction('keys', 'readwrite');
            tx.objectStore('keys').put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(new Error(tx.error?.message ?? 'Transaction error'));
        };
    });
};

const getFromIndexedDB = <T>(keyName: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('auth-db', 1);
        request.onsuccess = () => {
            const tx = request.result.transaction('keys', 'readonly');
            const keyRequest = tx.objectStore('keys').get(keyName);
            keyRequest.onsuccess = () => resolve(keyRequest.result as T);
            keyRequest.onerror = () => reject(new Error(tx.error?.message ?? 'Transaction error'));
        };
    });
};

export const generateDeviceId = async () => {
    const storedDeviceId = await getFromIndexedDB<string>(deviceIdKey);
    if (storedDeviceId) return storedDeviceId;

    const deviceId = uuid();
    await saveToDB<string>(deviceId, deviceIdKey);
    return deviceId;
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
