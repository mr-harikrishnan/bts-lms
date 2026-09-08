import { cookies } from "next/headers";
import { User } from "@/types";
import { getUserByEmail } from "./data/users";

export const SESSION_COOKIE_NAME = "bstorm_session";

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const userEmail = sessionCookie?.value;

    if (!userEmail) {
      return null;
    }

    const decodedEmail = decodeURIComponent(userEmail);
    const user = await getUserByEmail(decodedEmail);
    return user || null;
  } catch (error) {
    console.error("Authentication resolution error:", error);
    return null;
  }
}

export function createSessionCookie(email: string): string {
  const encoded = encodeURIComponent(email.toLowerCase().trim());
  return `${SESSION_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
