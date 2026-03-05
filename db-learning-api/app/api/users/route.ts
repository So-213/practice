/**
 * POST /api/users - ユーザ作成
 * GET /api/users - 一覧（簡易）
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return errorResponse("email and name are required", "VALIDATION_ERROR");
    }

    const user = await prisma.user.create({
      data: { email: String(email).trim(), name: String(name).trim() },
    });
    return jsonResponse(user);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return errorResponse("Email already exists", "DUPLICATE", 409);
    }
    throw e;
  }
}

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(users);
}
