import { Test, ITest } from '../models/Test.js';
import { Enrollment } from '../models/Enrollment.js';
import { toObjectId } from '../utils/objectId.js';
import { generateCertificate } from './certificate.service.js';

export async function getCourseTest(courseId: string, isPublic = true, moduleId?: string) {
  const courseOid = toObjectId(courseId);
  const query: any = { courseId: courseOid };
  if (moduleId) {
    query.moduleId = toObjectId(moduleId);
  } else {
    query.$or = [{ moduleId: null }, { moduleId: { $exists: false } }];
  }

  const test = await Test.findOne(query);
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
    type: q.type || 'mcq',
  }));

  return {
    _id: test._id,
    courseId: test.courseId,
    moduleId: test.moduleId || null,
    title: test.title,
    timeLimitMinutes: test.timeLimitMinutes,
    passingScore: test.passingScore,
    isOptional: test.isOptional ?? false,
    questions: publicQuestions,
  };
}

export async function gradeCourseTest(
  userId: string,
  courseId: string,
  answers: Record<string, any>,
  moduleId?: string
) {
  const courseOid = toObjectId(courseId);
  const userOid = toObjectId(userId);

  const query: any = { courseId: courseOid };
  if (moduleId) {
    query.moduleId = toObjectId(moduleId);
  } else {
    query.$or = [{ moduleId: null }, { moduleId: { $exists: false } }];
  }

  const rawTest = await Test.findOne(query);
  if (!rawTest) {
    const error: any = new Error(
      moduleId
        ? `No assessment found for module ID '${moduleId}'.`
        : `No assessment found for course ID '${courseId}'.`
    );
    error.statusCode = 404;
    throw error;
  }

  const totalQuestions = rawTest.questions.length;
  let correctCount = 0;
  const questionFeedback: any[] = [];

  for (const q of rawTest.questions) {
    const qId = q._id.toString();
    const isMsq = q.type === 'msq';
    let isCorrect = false;

    if (isMsq) {
      const expectedArr = Array.isArray(q.correctIndices)
        ? [...q.correctIndices].sort((a, b) => a - b)
        : [q.correctIndex || 0];

      let givenArr: number[] = [];
      if (Array.isArray(answers[qId])) {
        givenArr = answers[qId].map((n: any) => Number(n)).sort((a: number, b: number) => a - b);
      } else if (answers[qId] !== undefined) {
        givenArr = [Number(answers[qId])];
      }

      isCorrect =
        expectedArr.length === givenArr.length &&
        expectedArr.every((val, idx) => val === givenArr[idx]);
    } else {
      const given = answers[qId] !== undefined ? Number(answers[qId]) : -1;
      isCorrect = given === q.correctIndex;
    }

    if (isCorrect) {
      correctCount += 1;
    }

    questionFeedback.push({
      questionId: qId,
      correct: isCorrect,
      explanation: q.explanation || '',
      type: q.type || 'mcq',
      correctIndex: q.correctIndex,
      correctIndices: q.correctIndices || [],
    });
  }

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= rawTest.passingScore;

  let certificate = null;
  const isModuleTest = Boolean(moduleId);

  if (!isModuleTest) {
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
  }

  return {
    score,
    passed,
    passingScore: rawTest.passingScore,
    correctCount,
    totalQuestions,
    certificate,
    feedback: questionFeedback,
    isModuleTest,
    moduleId: moduleId || null,
  };
}

export async function adminUpsertTest(
  courseId: string,
  moduleId: string | null,
  testData: any
): Promise<ITest> {
  const courseOid = toObjectId(courseId);
  const moduleOid = moduleId ? toObjectId(moduleId) : null;

  const query: any = {
    courseId: courseOid,
    ...(moduleOid ? { moduleId: moduleOid } : { $or: [{ moduleId: null }, { moduleId: { $exists: false } }] }),
  };

  const payload: any = {
    courseId: courseOid,
    moduleId: moduleOid,
    title: testData.title,
    timeLimitMinutes: testData.timeLimitMinutes || 15,
    passingScore: testData.passingScore || 70,
    isOptional: Boolean(testData.isOptional),
    questions: (testData.questions || []).map((q: any) => ({
      question: String(q.question).trim(),
      codeSnippet: q.codeSnippet || '',
      options: (q.options || []).map((opt: any) => String(opt).trim()),
      type: q.type === 'msq' ? 'msq' : 'mcq',
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices.map(Number) : [],
      explanation: String(q.explanation || '').trim(),
    })),
  };

  const updated = await Test.findOneAndUpdate(query, { $set: payload }, { new: true, upsert: true });
  return updated;
}

export async function getCourseTestsForAdmin(courseId: string): Promise<ITest[]> {
  const courseOid = toObjectId(courseId);
  return Test.find({ courseId: courseOid });
}
