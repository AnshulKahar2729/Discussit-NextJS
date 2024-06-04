import { INFINITE_SCROLLLING_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import { Session } from 'next-auth';
import React from 'react'
import PostFeed from './PostFeed';

const CustomFeed = async ({ session} : {session : Session}) => {

  const followedCommunities = await db.subscription.findMany({
    where : {
      userId : session.user.id
    },
    include : {
      subreddit : true
    }
  });


  const posts = await db.post.findMany({
    where :  {
      subreddit : {
        id : {
          in : followedCommunities.map(sub => sub.subreddit.id)
        }
      }
    },
    orderBy : {
      createdAt : 'desc'
    },
    include : {
      author : true,
      votes : true,
      comments : true,
      subreddit : true
    },
    take : INFINITE_SCROLLLING_PAGINATION_RESULTS
  })

  return (
    <PostFeed initalPosts={posts}/>

  )
}

export default CustomFeed;