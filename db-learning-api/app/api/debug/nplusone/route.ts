/**
 * GET /api/debug/nplusone - わざとN+1が起きる取得
 * 投稿一覧を取得し、各投稿ごとにコメントを別クエリで取得（N+1問題）
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

  // 1. 投稿を取得（1クエリ）
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // 2. 各投稿ごとにコメントを取得 → N+1問題！（Nクエリ）
  const postsWithComments = await Promise.all(
    posts.map(async (post) => {
      const comments = await prisma.comment.findMany({
        where: { postId: post.id },
        include: { author: { select: { name: true } } },
      });
      return { ...post, comments };
    })
  );

  return jsonResponse({
    message: "N+1問題の例: 投稿1件ごとにコメント取得クエリが発行される",
    queryCount: `1 + ${posts.length} = ${1 + posts.length} queries`,
    data: postsWithComments,
  });
}
