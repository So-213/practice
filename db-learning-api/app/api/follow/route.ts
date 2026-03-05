/**
 * POST /api/follow - フォロー
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, notFoundResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return errorResponse("followerId and followingId are required", "VALIDATION_ERROR");
    }

    if (followerId === followingId) {
      return errorResponse("Cannot follow yourself", "BAD_REQUEST");
    }

    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } }),
    ]);
    if (!follower) return notFoundResponse("Follower user not found");
    if (!following) return notFoundResponse("Following user not found");

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
      include: {
        follower: { select: { id: true, name: true } },
        following: { select: { id: true, name: true } },
      },
    });
    return jsonResponse(follow);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return errorResponse("Already following this user", "DUPLICATE", 409);
    }
    throw e;
  }
}
