/**
 * POST /api/posts/:id/like - いいね
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
    const { userId } = body;

    if (!userId) {
      return errorResponse("userId is required", "VALIDATION_ERROR");
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return notFoundResponse("Post not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFoundResponse("User not found");

    const like = await prisma.like.create({
      data: { userId, postId },
      include: {
        user: { select: { id: true, name: true } },
        post: { select: { id: true, content: true } },
      },
    });
    return jsonResponse(like);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return errorResponse("Already liked this post", "DUPLICATE", 409);
    }
    throw e;
  }
}
