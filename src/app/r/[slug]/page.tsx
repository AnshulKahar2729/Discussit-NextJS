import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';
import { INFINITE_SCROLLLING_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import React, { FC } from 'react'

interface SubRedditPageProps {
    params: {
        slug: string

    }
}
const SubRedditPage = async ({ params }: SubRedditPageProps) => {
    const { slug } = params;

    const session = await getAuthSession();

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                },

                take: INFINITE_SCROLLLING_PAGINATION_RESULTS
            }
        },
        orderBy : {
            createdAt : 'desc'
        }
    });

    if (!subreddit) {
        notFound();
    };

    const posts = await db.post.findMany({
        where: {
            subredditId: subreddit.id
        }
    })


    return (
        <>
            <h1 className='font-bold text-3xl md:text-4xl h-14'>
                r/{subreddit.name}
            </h1>
            <MiniCreatePost session={session} />
            <PostFeed initalPosts={subreddit.posts} subredditName={subreddit.name} />
        </>
    )
}

export default SubRedditPage;