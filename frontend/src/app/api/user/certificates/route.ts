import { getAuthenticatedUser } from "@/lib/auth";
import { getUserCertificates } from "@/lib/data/certificates";
import { apiSuccess, unauthorizedError, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const certificates = await getUserCertificates(user.email);
    return apiSuccess(certificates);
  } catch (error) {
    return serverError(error, "Failed to retrieve certificates.");
  }
}
