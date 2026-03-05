/**
 * GET /api/debug/explain?sql=... - EXPLAIN ANALYZEを返す（ローカル専用・学習用）
 * 危険なため NODE_ENV=production では無効
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

const ALLOWED_PREFIXES = [
  "SELECT",
  "EXPLAIN",
  "WITH",
].map((s) => s.toUpperCase());

function isAllowedQuery(sql: string): boolean {
  const trimmed = sql.trim().toUpperCase();
  return ALLOWED_PREFIXES.some((p) => trimmed.startsWith(p));
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return errorResponse("EXPLAIN API is disabled in production", "BAD_REQUEST", 403);
  }

  const { searchParams } = new URL(request.url);
  const sql = searchParams.get("sql");

  if (!sql) {
    return errorResponse(
      "Query parameter 'sql' is required. Example: ?sql=SELECT * FROM \"User\" LIMIT 1",
      "VALIDATION_ERROR"
    );
  }

  if (!isAllowedQuery(sql)) {
    return errorResponse(
      "Only SELECT/EXPLAIN/WITH queries are allowed for safety",
      "BAD_REQUEST",
      400
    );
  }

  try {
    const result = await prisma.$queryRawUnsafe<unknown[]>(
      `EXPLAIN (ANALYZE, COSTS, FORMAT JSON) ${sql}`
    );
    return jsonResponse({ sql, explain: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return errorResponse(`Query failed: ${message}`, "BAD_REQUEST", 400);
  }
}
