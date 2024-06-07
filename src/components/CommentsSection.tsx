import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import React, { FC } from "react";
import CreateComment from "./CreateComment";
import PostComment from "./PostComment";

interface CommentsSectionProps {
  postId: string;
}
const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId: postId,
      replyToId: null,
    },
    include: {
      votes: true,
      author: true,
      replies: {
        include: {
          votes: true,
          author: true,
        },
      },
    },
  });

  return (
    <div className=" flex flex-col gap-y-4 mt-4">
      <hr className=" w-full " />

      <CreateComment postId={postId} />

      {comments
        .filter((comment) => !comment.replyToId)
        .map((topLvlCmt) => {
          const topLvlCmtVotesAmt = topLvlCmt.votes.reduce((acc, vote) => {
            if (vote.type === "UP") return acc + 1;
            if (vote.type === "DOWN") return acc - 1;
            return acc;
          }, 0);

          const topLvlCmtVote = topLvlCmt.votes.find(
            (vote) => vote.userId === session?.user.id
          );

          return (
            <div key={topLvlCmt.id} className=" flex flex-col">
              <div className=" mb-2">
                <PostComment
                  comment={topLvlCmt}
                  currentVote={topLvlCmtVote}
                  votesAmt={topLvlCmtVotesAmt}
                  postId={postId}
                />
              </div>

              {topLvlCmt.replies
                .sort((a, b) => b.votes.length - a.votes.length)
                .map((reply) => {
                  const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                    if (vote.type === "UP") return acc + 1;
                    if (vote.type === "DOWN") return acc - 1;
                    return acc;
                  }, 0);

                  const replyVote = reply.votes.find(
                    (vote) => vote.userId === session?.user.id
                  );

                  return (
                    <div
                      key={reply.id}
                      className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                    >
                      <PostComment
                        comment={reply}
                        currentVote={replyVote}
                        votesAmt={replyVotesAmt}
                        postId={postId}
                      />
                    </div>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
};

export default CommentsSection;
