import { Certificate } from "@/types";
import { readJsonFile, writeJsonFile } from "./storage";
import { getCourseById } from "./courses";
import { getUserByEmail } from "./users";

export async function getUserCertificates(userEmail: string): Promise<Certificate[]> {
  if (!userEmail) {
    return [];
  }

  const certificates = await readJsonFile<Certificate[]>("certificates.json");
  return certificates.filter(
    (c) => c.userEmail?.toLowerCase() === userEmail.trim().toLowerCase()
  );
}

export async function getCertificateById(
  certificateId: string
): Promise<Certificate | null> {
  if (!certificateId) {
    return null;
  }

  const certificates = await readJsonFile<Certificate[]>("certificates.json");
  const cert = certificates.find(
    (c) => c.id === certificateId || c.credentialId === certificateId
  );
  return cert || null;
}

export async function getCertificateByCourseId(
  userEmail: string,
  courseId: string
): Promise<Certificate | null> {
  if (!userEmail || !courseId) {
    return null;
  }

  const certs = await getUserCertificates(userEmail);
  const found = certs.find((c) => c.courseId === courseId);
  return found || null;
}

export async function generateCertificate(
  userEmail: string,
  courseId: string,
  score: number
): Promise<Certificate> {
  if (!userEmail || !courseId) {
    throw new Error("User email and courseId are required to generate a certificate.");
  }

  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error("Course does not exist.");
  }

  const user = await getUserByEmail(userEmail);
  const studentName = user?.name || "Hari";

  const certId = `cert-${courseId}-${Date.now()}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const hexKey =
    "0x" +
    Math.floor(Math.random() * 0xffffffffffff)
      .toString(16)
      .toUpperCase();

  const newCertificate: Certificate = {
    id: certId,
    userId: user?.id,
    userEmail: userEmail.trim().toLowerCase(),
    courseId,
    courseTitle: course.title,
    category: course.category,
    studentName,
    issueDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    credentialId: `BST-2025-${randomSuffix}-01B`,
    score,
    grade: score >= 90 ? "Honors" : "Pass",
    verificationKey: hexKey,
    instructorName: course.instructor?.name || "Faculty Board",
    directorName: "Dr. Arvind Swaminathan",
  };

  const certificates = await readJsonFile<Certificate[]>("certificates.json");
  // Replace existing certificate for same user & course if re-attempted
  const filtered = certificates.filter(
    (c) =>
      !(
        c.userEmail?.toLowerCase() === userEmail.trim().toLowerCase() &&
        c.courseId === courseId
      )
  );
  filtered.unshift(newCertificate);

  await writeJsonFile<Certificate[]>("certificates.json", filtered);
  return newCertificate;
}
