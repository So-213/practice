/**
 * POST /api/posts/:id/comments - コメント作成
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, notFoundResponse } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { authorId, content } = body;

    if (!authorId || !content) {
      return errorResponse("authorId and content are required", "VALIDATION_ERROR");
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return notFoundResponse("Post not found");

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) return notFoundResponse("Author user not found");

    const comment = await prisma.comment.create({
      data: { postId, authorId, content: String(content).trim() },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return jsonResponse(comment);
  } catch (e: unknown) {
    throw e;
  }
}
