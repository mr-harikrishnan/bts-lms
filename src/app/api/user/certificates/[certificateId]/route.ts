import { NextRequest } from "next/server";
import { getCertificateById } from "@/lib/data/certificates";
import {
  apiSuccess,
  notFoundError,
  serverError,
  invalidObjectIdError,
} from "@/lib/apiResponse";
import { isValidObjectId } from "@/lib/objectId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    if (!isValidObjectId(certificateId)) {
      return invalidObjectIdError("certificateId");
    }

    const certificate = await getCertificateById(certificateId);
    if (!certificate) {
      return notFoundError(`Certificate credential '${certificateId}' was not found.`);
    }

    return apiSuccess(certificate);
  } catch (error) {
    return serverError(error, "Failed to retrieve certificate record.");
  }
}
