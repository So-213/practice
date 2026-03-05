/**
 * GET /api/debug/optimized - N+1回避版
 * includeで一括取得し、1〜2クエリで完結
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

  // includeでコメントと著者を一括取得 → 1クエリ（JOINで取得）
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        include: { author: { select: { name: true } } },
      },
    },
  });

  return jsonResponse({
    message: "N+1回避: includeで1クエリで投稿+コメントを取得",
    queryCount: "1 query",
    data: posts,
  });
}
