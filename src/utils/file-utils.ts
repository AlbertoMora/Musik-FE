export const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result); // reader.result contains the Base64 data URL
        };

        reader.onerror = error => {
            let errorMessage: string;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                errorMessage = JSON.stringify(error);
            }
            reject(new Error(errorMessage));
        };

        reader.readAsDataURL(file); // Reads the file as a data URL (Base64 encoded)
    });
};
