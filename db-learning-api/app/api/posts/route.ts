/**
 * POST /api/posts - 投稿作成
 * GET /api/posts?authorId= - 投稿一覧（authorIdでフィルタ可）
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, notFoundResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorId, content } = body;

    if (!authorId || !content) {
      return errorResponse("authorId and content are required", "VALIDATION_ERROR");
    }

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) return notFoundResponse("Author user not found");

    const post = await prisma.post.create({
      data: { authorId, content: String(content).trim() },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return jsonResponse(post);
  } catch (e: unknown) {
    throw e;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");

  const posts = await prisma.post.findMany({
    where: authorId ? { authorId } : undefined,
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(posts);
}
