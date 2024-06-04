import { INFINITE_SCROLLLING_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import React from 'react'
import PostFeed from './PostFeed';

const GeneralFeed = async ({ }) => {

    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            votes: true,
            comments: true,
            subreddit: true,
            author: true
        },
        take : INFINITE_SCROLLLING_PAGINATION_RESULTS
    })

    return (
        <PostFeed initalPosts={posts}/>

        
    )
}

export default GeneralFeed;