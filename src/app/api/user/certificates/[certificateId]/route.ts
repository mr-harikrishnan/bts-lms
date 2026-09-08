import { NextRequest } from "next/server";
import { getCertificateById } from "@/lib/data/certificates";
import { apiSuccess, notFoundError, serverError } from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const certificate = await getCertificateById(certificateId);

    if (!certificate) {
      return notFoundError(`Certificate credential '${certificateId}' was not found.`);
    }

    return apiSuccess(certificate);
  } catch (error) {
    return serverError(error, "Failed to retrieve certificate record.");
  }
}
