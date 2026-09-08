import { NextResponse } from "next/server";
import { ApiResponse, ApiErrorResponse } from "@/types";

export function apiSuccess<T>(data: T, status: number = 200, headers?: HeadersInit) {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  return NextResponse.json(body, { status, headers });
}

export function apiError(
  message: string,
  status: number = 400,
  code?: string,
  headers?: HeadersInit
) {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
    },
  };
  return NextResponse.json(body, { status, headers });
}

export function unauthorizedError(message: string = "Unauthorized. Please log in to continue.") {
  return apiError(message, 401, "UNAUTHORIZED");
}

export function notFoundError(message: string = "Resource not found.") {
  return apiError(message, 404, "NOT_FOUND");
}

export function serverError(error: unknown, fallbackMessage: string = "An internal error occurred.") {
  console.error("API Server Error:", error);
  return apiError(fallbackMessage, 500, "INTERNAL_SERVER_ERROR");
}
