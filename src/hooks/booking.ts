import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBooking } from "../services/bookig";


export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelBooking,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        },
    });
};