import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const session = await getAuthSession();

    let followedCommunitiesId: string[] = [];

    if (session) {
      const followedCommunities = await db.subscription.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          subreddit: true,
        },
      });

      followedCommunitiesId = followedCommunities.map(
        (sub) => sub.subreddit.id
      );
    }

    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(), // what if you are at home page
      })
      .parse({
        subredditName: url.searchParams.get("subredditName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    // decide the query to find posts depending on whether you are at home page or subreddit page
    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: followedCommunitiesId,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      where: whereClause,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        votes: true,
        comments: true,
        author: true,
      },
    });

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (
        new Response("Invalid GET Request params passed"),
        {
          status: 422,
        }
      );
    }

    return new Response(
      "Could not get post right now, please try again later !!!",
      {
        status: 500,
      }
    );
  }
}
