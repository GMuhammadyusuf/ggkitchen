import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useTranslations() {
    return useQuery({
        queryKey: ['translations'],
        queryFn: async () => {
            const { data } = await axios.get('/api/translations');
            return data;
        },
    });
}

export function useCreateTranslation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTranslation: { key: string; en: string; uz: string }) => {
            const { data } = await axios.post('/api/translations', newTranslation);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['translations'] });
        },
    });
}

export function useUpdateTranslation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: number; en: string; uz: string }) => {
            const { data } = await axios.put(`/api/translations/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['translations'] });
        },
    });
}

export function useDeleteTranslation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await axios.delete(`/api/translations/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['translations'] });
        },
    });
}
