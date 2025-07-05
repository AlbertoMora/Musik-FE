export const webRequest = (url: string) => {
    return {
        post: async <Q>(body: Q) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return res;
        },
    };
};
