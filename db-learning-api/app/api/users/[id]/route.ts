/**
 * GET /api/users/:id - ユーザ取得
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, notFoundResponse } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return notFoundResponse("User not found");
  return jsonResponse(user);
}
