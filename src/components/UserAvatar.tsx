"use client"

import { User } from 'next-auth';
import React, { FC } from 'react'
import { Avatar } from './ui/Avatar';
import Image from 'next/image';
import { AvatarFallback, AvatarProps } from '@radix-ui/react-avatar';
import { Icons } from './Icons';

interface UserAvatarProps extends AvatarProps {
    user: Pick<User, 'name' | 'image'>

}
const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
    return (
        <Avatar {...props}>
            {user?.image ? (<div className=' relative aspect-square h-full w-full'>
                <Image fill src={user?.image} alt='profile-picture' referrerPolicy='no-referrer' />
            </div>) : (<AvatarFallback>
                <span className=' sr-only'>{user?.name}</span>
                <Icons.user className=' w-4 h-4' />
            </AvatarFallback>)}
        </Avatar>
    )
}

export default UserAvatar;