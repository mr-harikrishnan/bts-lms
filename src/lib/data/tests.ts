import { CourseTest, PublicCourseTest, TestSubmissionResult } from "@/types";
import { readJsonFile } from "./storage";
import { updateEnrollmentTestResult } from "./enrollments";
import { generateCertificate } from "./certificates";

export async function getCourseTest(
  courseId: string,
  publicOnly: boolean = true
): Promise<CourseTest | PublicCourseTest | null> {
  if (!courseId) {
    return null;
  }

  const tests = await readJsonFile<CourseTest[]>("tests.json");
  let found = tests.find((t) => t.courseId === courseId);

  // Fallback to full-stack-web-dev if specialized test is missing
  if (!found) {
    found = tests.find((t) => t.courseId === "full-stack-web-dev");
  }

  if (!found) {
    return null;
  }

  if (!publicOnly) {
    return found;
  }

  // Strip answers to prevent client inspection
  const sanitized: PublicCourseTest = {
    courseId: found.courseId,
    title: found.title,
    timeLimitMinutes: found.timeLimitMinutes,
    passingScore: found.passingScore,
    questions: found.questions.map((q) => ({
      id: q.id,
      question: q.question,
      codeSnippet: q.codeSnippet,
      options: q.options,
    })),
  };

  return sanitized;
}

export async function gradeCourseTest(
  userEmail: string,
  courseId: string,
  answers: Record<number, number>
): Promise<TestSubmissionResult> {
  if (!userEmail || !courseId) {
    throw new Error("User email and courseId are required to submit an assessment.");
  }

  const rawTest = (await getCourseTest(courseId, false)) as CourseTest | null;
  if (!rawTest) {
    throw new Error("Assessment test not found for this course.");
  }

  const totalQuestions = rawTest.questions.length;
  let correctCount = 0;

  rawTest.questions.forEach((q) => {
    if (answers[q.id] !== undefined && answers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= rawTest.passingScore;

  let certificate;
  if (passed) {
    certificate = await generateCertificate(userEmail, courseId, score);
  }

  await updateEnrollmentTestResult(
    userEmail,
    courseId,
    score,
    passed,
    certificate ? certificate.id : undefined
  );

  return {
    score,
    passed,
    passingScore: rawTest.passingScore,
    correctCount,
    totalQuestions,
    certificate,
  };
}
