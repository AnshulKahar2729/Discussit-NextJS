import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  SubredditSubscriptionValidator,
  SubredditValidator,
} from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subscription = await db.subscription.findFirst({
      where: {
        subredditId: subredditId,
        userId: session.user.id,
      },
    });

    if (subscription) {
      return new Response("You are already subscribed to this subreddit.", {
        status: 400,
      });
    }

    await db.subscription.create({
      data: {
        subredditId: subredditId,
        userId: session.user.id,
      },
    });

    return new Response("Subscribed to subreddit successfully.", {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    };

    return new Response("Could not subscribe, please try again later", { status: 500 });
  }
}
