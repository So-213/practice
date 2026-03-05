/**
 * API共通ユーティリティ（エラーハンドリング、レスポンス）
 */
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DUPLICATE"
  | "BAD_REQUEST";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  code: ApiErrorCode = "BAD_REQUEST",
  status = 400
) {
  return NextResponse.json({ error: message, code }, { status });
}

export function notFoundResponse(message = "Not found") {
  return errorResponse(message, "NOT_FOUND", 404);
}
