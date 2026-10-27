const devicePK = 'device-pk';
const devicePbK = 'device-pbk';
const deviceIdKey = 'device-id';
const algorithmConfig = {
    name: 'ECDSA',
    namedCurve: 'P-256',
};
import { v4 as uuid } from 'uuid';

export const generateKeyPair = async () => {
    try {
        const currentPbk = await getFromIndexedDB<CryptoKey>(devicePbK);

        if (currentPbk) {
            const pubKey64 = await getBase64PublicKey(currentPbk);
            return { pubKey: pubKey64, keyPair: null };
        }
    } catch {
        // Proceed to generate a new key pair if not found or DB was not initialized
    }

    const keyPair = await crypto.subtle.generateKey(algorithmConfig, false, ['sign', 'verify']);

    await saveToDB(keyPair.privateKey, devicePK);
    await saveToDB(keyPair.publicKey, devicePbK);

    const pubKey64 = await getBase64PublicKey(keyPair.publicKey);

    return { pubKey: pubKey64, keyPair };
};

const getBase64PublicKey = async (publicKey: CryptoKey) => {
    const pubKey = await crypto.subtle.exportKey('spki', publicKey);
    const pubKey64 = btoa(String.fromCodePoint(...new Uint8Array(pubKey)));
    return pubKey64;
};

export const signValue = async (value: string) => {
    const key = await getFromIndexedDB<CryptoKey>(devicePK);
    const encoder = new TextEncoder();

    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        key,
        encoder.encode(value),
    );

    const derSign = toDER(new Uint8Array(signature));

    return btoa(String.fromCodePoint(...derSign));
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

export const generateDeviceId = async () => {
    try {
        const storedDeviceId = await getFromIndexedDB<string>(deviceIdKey);
        if (storedDeviceId) return storedDeviceId;
    } catch {
        // Fallback to generating a new device ID
    }

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
