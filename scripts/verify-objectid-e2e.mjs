// End-to-end verification script for MongoDB ObjectId adherence
const BASE_URL = 'http://localhost:3000';
const OID_REGEX = /^[0-9a-fA-F]{24}$/;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function run() {
  console.log('--- 1. Testing Invalid ObjectId Rejection (400 Bad Request) ---');
  
  const invalidTests = [
    { name: 'Course by custom slug', url: `${BASE_URL}/api/courses/course-123` },
    { name: 'Course by short id', url: `${BASE_URL}/api/courses/12345` },
    { name: 'Course modules by invalid id', url: `${BASE_URL}/api/courses/invalid/modules` },
    { name: 'Course lessons by invalid id', url: `${BASE_URL}/api/courses/invalid/lessons` },
    { name: 'Course single lesson by invalid lessonId', url: `${BASE_URL}/api/courses/68a1c0000000000000000001/lessons/lesson-99` },
    { name: 'Module by invalid id', url: `${BASE_URL}/api/modules/module-xyz` },
    { name: 'Lesson by invalid id', url: `${BASE_URL}/api/lessons/lesson-abc` },
    { name: 'User by invalid id', url: `${BASE_URL}/api/users/user-123` },
    { name: 'Certificate by invalid id', url: `${BASE_URL}/api/user/certificates/cert-456` },
    { name: 'Course test by invalid id', url: `${BASE_URL}/api/courses/bad-course-id/test` },
    { name: 'User progress by invalid id', url: `${BASE_URL}/api/user/courses/not-an-oid/progress` },
  ];

  for (const t of invalidTests) {
    const res = await fetch(t.url);
    const body = await res.json();
    assert(res.status === 400, `${t.name} returned 400 Bad Request (got ${res.status})`);
    assert(body.success === false, `${t.name} body has success: false`);
  }

  console.log('\n--- 2. Testing Valid ObjectId Queries & Document Structures ---');
  
  // Courses List
  const coursesRes = await fetch(`${BASE_URL}/api/courses`);
  const coursesData = await coursesRes.json();
  assert(coursesRes.status === 200, 'GET /api/courses returned 200');
  assert(Array.isArray(coursesData.data), 'Courses data is an array');
  for (const c of coursesData.data) {
    assert(OID_REGEX.test(c._id), `Course ${c.title} has valid ObjectId _id: ${c._id}`);
    assert(c.id === undefined, `Course does NOT have custom .id field`);
  }

  const sampleCourseId = coursesData.data[0]._id;

  // Single Course
  const courseRes = await fetch(`${BASE_URL}/api/courses/${sampleCourseId}`);
  const courseData = await courseRes.json();
  assert(courseRes.status === 200, `GET /api/courses/${sampleCourseId} returned 200`);
  assert(courseData.data._id === sampleCourseId, 'Single course _id matches requested ObjectId');

  // Course Modules
  const modulesRes = await fetch(`${BASE_URL}/api/courses/${sampleCourseId}/modules`);
  const modulesData = await modulesRes.json();
  assert(modulesRes.status === 200, 'GET /api/courses/:id/modules returned 200');
  assert(modulesData.data.length > 0, 'Course has modules');
  for (const m of modulesData.data) {
    assert(OID_REGEX.test(m._id), `Module ${m.title} has valid ObjectId _id: ${m._id}`);
    assert(m.courseId === sampleCourseId, `Module courseId matches parent course ObjectId: ${m.courseId}`);
  }

  const sampleModuleId = modulesData.data[0]._id;

  // Single Module
  const singleModuleRes = await fetch(`${BASE_URL}/api/modules/${sampleModuleId}`);
  const singleModuleData = await singleModuleRes.json();
  assert(singleModuleRes.status === 200, `GET /api/modules/${sampleModuleId} returned 200`);
  assert(singleModuleData.data._id === sampleModuleId, 'Single module _id matches requested ObjectId');

  // Course Lessons
  const lessonsRes = await fetch(`${BASE_URL}/api/courses/${sampleCourseId}/lessons`);
  const lessonsData = await lessonsRes.json();
  assert(lessonsRes.status === 200, 'GET /api/courses/:id/lessons returned 200');
  assert(lessonsData.data.length > 0, 'Course has lessons');
  for (const l of lessonsData.data) {
    assert(OID_REGEX.test(l._id), `Lesson ${l.title} has valid ObjectId _id: ${l._id}`);
    assert(l.courseId === sampleCourseId, `Lesson courseId matches course ObjectId`);
    assert(OID_REGEX.test(l.moduleId), `Lesson moduleId is a valid ObjectId: ${l.moduleId}`);
  }

  const sampleLessonId = lessonsData.data[0]._id;

  // Single Lesson
  const singleLessonRes = await fetch(`${BASE_URL}/api/lessons/${sampleLessonId}`);
  const singleLessonData = await singleLessonRes.json();
  assert(singleLessonRes.status === 200, `GET /api/lessons/${sampleLessonId} returned 200`);
  assert(singleLessonData.data._id === sampleLessonId, 'Single lesson _id matches requested ObjectId');

  // Single User
  const userRes = await fetch(`${BASE_URL}/api/users/68a1a0000000000000000001`);
  const userData = await userRes.json();
  assert(userRes.status === 200, 'GET /api/users/68a1a0000000000000000001 returned 200');
  assert(userData.data._id === '68a1a0000000000000000001', 'User _id is valid ObjectId');

  console.log('\n--- 3. Testing Assessments & Certificates with ObjectIds ---');
  
  // Login to get session cookie
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'hari.prasath@example.com',
      password: 'password123',
    }),
  });
  assert(loginRes.status === 200, 'POST /api/auth/login returned 200');
  const loginCookie = loginRes.headers.get('set-cookie');
  const cookieHeader = loginCookie ? loginCookie.split(';')[0] : 'bstorm_session=hari.prasath%40example.com';
  console.log(`Authenticated session cookie: ${cookieHeader}`);

  // Test retrieval for Course 68a1c0000000000000000005 (TypeScript Mastery)
  const testCourseId = '68a1c0000000000000000005';
  const testRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/test`, {
    headers: { 'Cookie': cookieHeader },
  });
  const testData = await testRes.json();
  assert(testRes.status === 200, `GET /api/courses/${testCourseId}/test returned 200`);
  assert(OID_REGEX.test(testData.data._id), `Course test _id is valid ObjectId: ${testData.data._id}`);
  assert(testData.data.questions.length > 0, 'Test has questions');
  
  const answers = {
    '68a180000000000000000006': 2,
    '68a180000000000000000007': 1,
    '68a180000000000000000008': 1,
    '68a180000000000000000009': 1,
    '68a18000000000000000000a': 1,
  };

  // Submit test
  const submitRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/test/submit`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      answers,
    }),
  });
  const submitData = await submitRes.json();
  assert(submitRes.status === 200, 'Assessment submission returned 200');
  assert(Boolean(submitData.data.certificate), 'Certificate was issued');
  const certId = submitData.data.certificate._id;
  assert(OID_REGEX.test(certId), `Generated certificateId is valid ObjectId: ${certId}`);

  // Fetch certificate
  const certRes = await fetch(`${BASE_URL}/api/user/certificates/${certId}`, {
    headers: { 'Cookie': cookieHeader },
  });
  const certData = await certRes.json();
  assert(certRes.status === 200, 'GET certificate returned 200');
  assert(certData.data._id === certId, 'Certificate _id matches returned certificateId');
  assert(OID_REGEX.test(certData.data.courseId), `Certificate courseId is valid ObjectId: ${certData.data.courseId}`);
  assert(OID_REGEX.test(certData.data.userId), `Certificate userId is valid ObjectId: ${certData.data.userId}`);

  console.log('\n🎉 ALL E2E OBJECTID ADHERENCE TESTS PASSED SUCCESSFULLY! 🎉');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
