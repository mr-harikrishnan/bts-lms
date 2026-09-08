import { Test } from '../models/Test.js';
import { Enrollment } from '../models/Enrollment.js';
import { toObjectId } from '../utils/objectId.js';
import { generateCertificate } from './certificate.service.js';

export async function getCourseTest(courseId: string, isPublic = true) {
  const courseOid = toObjectId(courseId);
  const test = await Test.findOne({ courseId: courseOid });
  if (!test) {
    return null;
  }

  if (!isPublic) {
    return test;
  }

  // Sanitize questions to prevent answer key leak
  const publicQuestions = test.questions.map((q) => ({
    _id: q._id,
    question: q.question,
    codeSnippet: q.codeSnippet || '',
    options: q.options,
  }));

  return {
    _id: test._id,
    courseId: test.courseId,
    title: test.title,
    timeLimitMinutes: test.timeLimitMinutes,
    passingScore: test.passingScore,
    questions: publicQuestions,
  };
}

export async function gradeCourseTest(
  userId: string,
  courseId: string,
  answers: Record<string, number>
) {
  const courseOid = toObjectId(courseId);
  const userOid = toObjectId(userId);

  const rawTest = await Test.findOne({ courseId: courseOid });
  if (!rawTest) {
    const error: any = new Error(`No assessment found for course ID '${courseId}'.`);
    error.statusCode = 404;
    throw error;
  }

  const totalQuestions = rawTest.questions.length;
  let correctCount = 0;

  for (const q of rawTest.questions) {
    const qId = q._id.toString();
    if (answers[qId] !== undefined && answers[qId] === q.correctIndex) {
      correctCount += 1;
    }
  }

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= rawTest.passingScore;

  let certificate = null;
  if (passed) {
    certificate = await generateCertificate(userId, courseId, score);
  }

  await Enrollment.findOneAndUpdate(
    { userId: userOid, courseId: courseOid },
    {
      testScore: score,
      testPassed: passed,
      ...(certificate ? { certificateId: certificate._id } : {}),
    }
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
