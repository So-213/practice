/**
 * GET /api/feed/:userId - フォローしているユーザの投稿を新しい順で返す
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, notFoundResponse } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return notFoundResponse("User not found");

  const followingIds = await prisma.follow
    .findMany({ where: { followerId: userId }, select: { followingId: true } })
    .then((rows) => rows.map((r) => r.followingId));

  if (followingIds.length === 0) {
    return jsonResponse([]);
  }

  const posts = await prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(posts);
}
