/**
 * PrismaClient シングルトン（dev時の二重生成を防ぐ）
 * クエリログを有効化（学習用）
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;

  // クエリログをコンソールに出力（学習用）
  prisma.$on("query" as never, (e: { query: string; params: string; duration: number }) => {
    console.log("[Prisma Query]", e.query);
    console.log("[Prisma Params]", e.params);
    console.log("[Prisma Duration]", e.duration, "ms");
  });
}
