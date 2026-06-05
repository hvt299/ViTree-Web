import apiClient from '@/lib/api';

export const uploadService = {
    uploadImage: async (file: File): Promise<string> => {
        const authData: any = await apiClient.get('/upload/signature');
        const { timestamp, signature, apiKey, cloudName } = authData;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Upload ảnh thất bại!');
        }

        const data = await response.json();
        return data.secure_url;
    },
};