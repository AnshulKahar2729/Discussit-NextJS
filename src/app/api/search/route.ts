import { db } from "@/lib/db";

export async function GET(req:Request) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get('q');

        if(!q) return new Response('No query provided', {status: 400});

        const results = await db.subreddit.findMany({
            where : {
                name :  {
                    startsWith : q
                }
            },
            include : {
                _count : true,
            },
            take : 5
        });

        return new Response(JSON.stringify(results), {status: 200});
    } catch (error) {
        return new Response("There is a problem in searching with provided query.", {status: 500});
    }
}