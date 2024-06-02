"use client"

import { useMutation } from '@tanstack/react-query'
import React, { FC, startTransition } from 'react'
import { Button } from './ui/Button'
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit'
import axios, { AxiosError } from 'axios'
import { useCustomToasts } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface SubscribeLeaveToggleProps {
    isSubscribed: boolean
    subredditId: string
    subredditName: string
}
const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ subredditId, subredditName, isSubscribed }) => {


    const { loginToast } = useCustomToasts();
    const router = useRouter();

    const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId: subredditId,
            };

            const { data } = await axios.post('/api/subreddit/subscribe', payload);
            return data as string;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                return loginToast();
            };

            return toast({
                title: 'Error !!.',
                description: 'Somewent wrong, please try again later.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
            });

            return toast({
                title: 'Success',
                description: `You are now subscribed to subreddit r/${subredditName}.`
            })
        }
    });

    const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }

            const { data } = await axios.post('/api/subreddit/unsubscribe', payload)
            return data as string
        },
        onError: (err: AxiosError) => {
            toast({
                title: 'Error',
                description: err.response?.data as string,
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
            })
            toast({
                title: 'Unsubscribed!',
                description: `You are now unsubscribed from/${subredditName}`,
            })
        },
    })



    return isSubscribed ? (
        <Button
            className=' w-full mt-1 mb-4'
            isLoading={isUnsubLoading}
            onClick={() => unsubscribe()}>
            Leave community
        </Button>
    ) : (
        <Button
            isLoading={isSubLoading}
            onClick={() => subscribe()} className=' w-full mt-1 mb-4'>
            Join community
        </Button>)
}

export default SubscribeLeaveToggle;