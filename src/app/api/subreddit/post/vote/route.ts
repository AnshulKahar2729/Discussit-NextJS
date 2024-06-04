import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { postId, voteType } = PostVoteValidator.parse(body);

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId: postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId: postId,
              userId: session.user.id,
            },
          },
        });

        return new Response("OK", { status: 200 });
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId: postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      // since vote has been updated... time to recount it.
      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "DOWN") return acc - 1;
        if (vote.type === "UP") return acc + 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachedPayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          // currentVote : voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${post.id}`, cachedPayload);
      }

      return new Response("ok", { status: 200 });
    }

    await db.vote.create({
      data: {
        type: voteType,
        postId: postId,
        userId: session.user.id,
      },
    });

    // since vote has been updated... time to recount it.
    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "DOWN") return acc - 1;
      if (vote.type === "UP") return acc + 1;
      return acc;
    }, 0);

    // decide whether to cache the data or not
    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachedPayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        // currentVote : voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${post.id}`, cachedPayload);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid vote request data passed", { status: 400 });
    }

    return new Response(
      "Could not vote to the post right now, please try again later",
      { status: 500 }
    );
  }
}
