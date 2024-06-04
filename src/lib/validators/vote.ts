import { z } from "zod";

export const PostVoteValidator = z.object({
  voteType: z.enum(["UP", "DOWN"]),
  postId: z.string(),
});

export type PostVoteRequest = z.infer<typeof PostVoteValidator>;

export const CommentVoteValidator = z.object({
  voteType: z.enum(["UP", "DOWN"]),
  commentId: z.string(),
});

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>;
