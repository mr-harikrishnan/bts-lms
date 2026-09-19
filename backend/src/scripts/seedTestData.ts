/**
 * seedTestData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds a complete demo course with proper Module + Lesson + Test documents:
 *   • Course:  "Full-Stack Web Development Bootcamp" (free)
 *   • 4 Modules × 3 Lessons each (12 lessons total)
 *   • Module tests: M1 (Required), M2 (Optional), M3 (Required), M4 (none)
 *   • Final certification exam
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: npm run seed:tests   (from /backend)
 */

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Test } from '../models/Test.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_VIDEO =
  'https://res.cloudinary.com/ddifxio8b/video/upload/v1788807587/12987350_3840_2160_30fps_doncq1.mp4';
const DEMO_THUMBNAIL =
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=1200';
const DEMO_TITLE = 'Full-Stack Web Development Bootcamp';

// ─── Module Data ──────────────────────────────────────────────────────────────

const MODULE_DATA = [
  {
    moduleNumber: 'M1',
    title: 'HTML, CSS & JavaScript Foundations',
    order: 1,
    lessons: [
      { lessonNumber: 'L1', title: 'Introduction & Core Concepts', duration: '14 mins', order: 1 },
      { lessonNumber: 'L2', title: 'Hands-on Practice & Examples', duration: '19 mins', order: 2 },
      { lessonNumber: 'L3', title: 'Project: Build & Deploy', duration: '22 mins', order: 3 },
    ],
    testConfig: {
      isOptional: false,
      title: 'M1 Assessment: HTML, CSS & JavaScript Foundations',
      timeLimitMinutes: 15,
      passingScore: 70,
      questions: [
        {
          question: 'Which HTML tag is used to link an external CSS stylesheet?',
          type: 'mcq',
          options: [
            '<link rel="stylesheet" href="styles.css">',
            '<style src="styles.css">',
            '<css href="styles.css">',
            '<script src="styles.css">',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'The <link> element with rel="stylesheet" is the correct way to include an external CSS file.',
        },
        {
          question: 'What does the CSS box model consist of? (Select all that apply)',
          type: 'msq',
          options: ['Content', 'Padding', 'Border', 'Margin', 'Outline'],
          correctIndex: 0,
          correctIndices: [0, 1, 2, 3],
          explanation: 'The CSS box model includes content, padding, border, and margin.',
        },
        {
          question: 'Which of the following correctly declares a JavaScript arrow function?',
          type: 'mcq',
          options: [
            'const greet = (name) => `Hello ${name}`;',
            'function greet = (name) => `Hello ${name}`;',
            'const greet(name) => `Hello ${name}`;',
            'let greet = function(name) { return `Hello ${name}` }',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'Arrow functions use: const fn = (params) => expression.',
        },
        {
          question: 'What is the purpose of the "defer" attribute on a <script> tag?',
          type: 'mcq',
          options: [
            'Delay script execution until HTML is fully parsed',
            'Load the script in a separate thread',
            'Prevent the script from running',
            'Execute the script before any HTML is parsed',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: '"defer" ensures scripts run only after HTML parsing completes.',
        },
        {
          question: 'Which CSS property controls the stacking order of overlapping elements?',
          type: 'mcq',
          options: ['z-index', 'stack-order', 'layer', 'position-index'],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'z-index controls the visual stacking context. Higher values appear on top.',
        },
      ],
    },
  },
  {
    moduleNumber: 'M2',
    title: 'React & Modern Frontend Development',
    order: 2,
    lessons: [
      { lessonNumber: 'L4', title: 'State Management Deep Dive', duration: '18 mins', order: 1 },
      { lessonNumber: 'L5', title: 'Performance Optimisation', duration: '21 mins', order: 2 },
      { lessonNumber: 'L6', title: 'Advanced Patterns', duration: '25 mins', order: 3 },
    ],
    testConfig: {
      isOptional: true, // Optional — students can skip and proceed
      title: 'M2 Assessment: React & Frontend Development (Optional)',
      timeLimitMinutes: 15,
      passingScore: 70,
      questions: [
        {
          question: 'What React hook is used to manage local component state?',
          type: 'mcq',
          options: ['useState', 'useEffect', 'useRef', 'useReducer'],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'useState returns a stateful value and a setter function for updating it.',
        },
        {
          question: 'Which of the following are valid React hooks? (Select all that apply)',
          type: 'msq',
          options: ['useEffect', 'useCallback', 'useMemo', 'useDOM', 'useContext'],
          correctIndex: 0,
          correctIndices: [0, 1, 2, 4],
          explanation: 'useEffect, useCallback, useMemo, and useContext are built-in hooks. useDOM is not.',
        },
        {
          question: 'What is the purpose of the React "key" prop in lists?',
          type: 'mcq',
          options: [
            'Help React identify which items have changed, added, or removed',
            'Style the list item',
            'Prevent re-renders of the list',
            'Pass data between components',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'Keys help React efficiently update the DOM by tracking element changes.',
        },
        {
          question: 'What is the difference between props and state in React?',
          type: 'mcq',
          options: [
            'Props are passed from parent and immutable; state is managed inside and mutable',
            'Props and state are the same thing',
            'State is passed from parent; props are local',
            'Neither props nor state cause re-renders',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'Props flow down from parent (read-only). State is managed within the component and can change.',
        },
      ],
    },
  },
  {
    moduleNumber: 'M3',
    title: 'Node.js, Express & REST APIs',
    order: 3,
    lessons: [
      { lessonNumber: 'L7', title: 'API Design & Integration', duration: '20 mins', order: 1 },
      { lessonNumber: 'L8', title: 'Authentication & Security', duration: '24 mins', order: 2 },
      { lessonNumber: 'L9', title: 'Error Handling & Testing', duration: '18 mins', order: 3 },
    ],
    testConfig: {
      isOptional: false,
      title: 'M3 Assessment: Node.js, Express & REST APIs',
      timeLimitMinutes: 20,
      passingScore: 70,
      questions: [
        {
          question: 'Which HTTP method is used to CREATE a new resource in REST?',
          type: 'mcq',
          options: ['POST', 'GET', 'PUT', 'DELETE'],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'POST creates a new resource. GET retrieves, PUT updates, DELETE removes.',
        },
        {
          question: 'What does Express middleware do?',
          type: 'mcq',
          options: [
            'Functions that execute during the request-response cycle',
            'A database layer for Express',
            'The template engine used by Express',
            'The HTTP server created by Express',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'Middleware functions have access to req, res, and next(). They can modify requests and responses.',
        },
        {
          question: 'Which Node.js built-in module is used to create an HTTP server?',
          type: 'mcq',
          options: ['http', 'net', 'stream', 'fs'],
          correctIndex: 0,
          correctIndices: [0],
          explanation: "The built-in 'http' module provides createServer() for raw HTTP server creation.",
        },
        {
          question: 'Which HTTP status codes indicate a successful REST response? (Select all)',
          type: 'msq',
          options: ['200 OK', '201 Created', '204 No Content', '404 Not Found', '500 Server Error'],
          correctIndex: 0,
          correctIndices: [0, 1, 2],
          explanation: '2xx codes indicate success. 4xx and 5xx are client/server errors.',
        },
        {
          question: 'What is the role of JWT in API authentication?',
          type: 'mcq',
          options: [
            'Securely transmit user identity as a signed token',
            'Encrypt the database connection string',
            'Store session data server-side',
            'Hash passwords before storage',
          ],
          correctIndex: 0,
          correctIndices: [0],
          explanation: 'JWTs carry signed claims that the server verifies, enabling stateless authentication.',
        },
      ],
    },
  },
  {
    moduleNumber: 'M4',
    title: 'Databases, Deployment & Portfolio',
    order: 4,
    lessons: [
      { lessonNumber: 'L10', title: 'Database Architecture', duration: '22 mins', order: 1 },
      { lessonNumber: 'L11', title: 'Query Optimisation & Indexing', duration: '19 mins', order: 2 },
      { lessonNumber: 'L12', title: 'Final Review & Portfolio', duration: '28 mins', order: 3 },
    ],
    testConfig: null, // No module test — free progression to final exam
  },
];

// ─── Final Exam ───────────────────────────────────────────────────────────────

const FINAL_EXAM_QUESTIONS = [
  {
    question: 'A user submits a login form. Which HTTP method and endpoint convention is most appropriate?',
    type: 'mcq',
    options: ['POST /api/auth/login', 'GET /api/auth/login', 'PUT /api/users/login', 'DELETE /api/session'],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'POST is used to send credentials securely. GET would expose them in the URL.',
  },
  {
    question: "Which of the following are true about React's virtual DOM? (Select all)",
    type: 'msq',
    options: [
      'It is a lightweight in-memory representation of the real DOM',
      'React diffs the virtual DOM to determine minimal real DOM updates',
      'It directly manipulates browser memory',
      'It eliminates the need for any re-renders',
    ],
    correctIndex: 0,
    correctIndices: [0, 1],
    explanation: 'The virtual DOM is an in-memory tree React uses for diffing.',
  },
  {
    question: 'You need to store user sessions securely. Which approach is preferred?',
    type: 'mcq',
    options: [
      'HttpOnly cookies for refresh tokens, Bearer tokens for access tokens',
      'Store both tokens in localStorage',
      'Store tokens in sessionStorage only',
      'Include tokens as query parameters',
    ],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'HttpOnly cookies protect refresh tokens from XSS. Short-lived access tokens go in memory.',
  },
  {
    question: 'What is the primary purpose of database indexing?',
    type: 'mcq',
    options: [
      'Speed up read queries by maintaining a sorted data structure',
      'Encrypt stored data',
      'Automatically backup the database',
      'Prevent duplicate records',
    ],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'Indexes allow the DB engine to find records without scanning the entire collection.',
  },
  {
    question: 'Which of the following best describes the CSS Flexbox layout model?',
    type: 'mcq',
    options: [
      'A one-dimensional layout system for rows or columns',
      'A two-dimensional layout system for rows and columns simultaneously',
      'A system for absolute pixel positioning',
      'A JavaScript-based layout engine',
    ],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'Flexbox is one-dimensional. CSS Grid is two-dimensional.',
  },
  {
    question: 'When does React trigger a re-render? (Select all that apply)',
    type: 'msq',
    options: [
      'When its state changes via useState setter',
      'When its props change',
      'When a parent component re-renders',
      'When window.location changes',
      'When a CSS class is toggled',
    ],
    correctIndex: 0,
    correctIndices: [0, 1, 2],
    explanation: 'State changes, prop changes, and parent re-renders trigger re-renders.',
  },
  {
    question: 'What is the difference between == and === in JavaScript?',
    type: 'mcq',
    options: [
      '=== checks value AND type (strict); == only checks value after coercion',
      '== is strict; === is loose',
      'They are identical in all cases',
      '=== cannot compare strings',
    ],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'Always prefer === to avoid unexpected type coercions.',
  },
  {
    question: 'Which MongoDB method returns a single document matching a query?',
    type: 'mcq',
    options: ['findOne()', 'find()', 'findAll()', 'getOne()'],
    correctIndex: 0,
    correctIndices: [0],
    explanation: 'findOne() returns the first matching document. find() returns a cursor over all matches.',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function seedTestData() {
  console.log('\n[SeedTests] ─────────────────────────────────────');
  console.log('[SeedTests] Starting seed...');
  await connectDatabase();

  // 1. Find or create the demo course
  let course = await Course.findOne({ title: DEMO_TITLE });

  if (!course) {
    course = await Course.create({
      title: DEMO_TITLE,
      category: 'Web Development',
      level: 'Beginner-Friendly',
      duration: '6h 24m',
      durationWeeks: 8,
      hoursLive: 0,
      lessonCount: 12,
      description:
        'A comprehensive project-based bootcamp covering HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and cloud deployment. Build real-world projects and earn your certificate.',
      thumbnail: DEMO_THUMBNAIL,
      instructor: {
        name: 'DLABS Instructor',
        title: 'Full-Stack Developer & Educator',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      },
      originalPrice: 4999,
      price: 0,
      previewVideoUrl: DEMO_VIDEO,
      videoUrl: DEMO_VIDEO,
      isPublished: true,
      featured: false,
    });
    console.log(`[SeedTests] ✓ Created course: "${DEMO_TITLE}" (${course._id})`);
  } else {
    console.log(`[SeedTests] ↩ Reusing existing course: "${DEMO_TITLE}" (${course._id})`);
  }

  const courseId = course._id as mongoose.Types.ObjectId;

  // 2. Clear existing modules, lessons, and tests for this course
  // Drop stale indexes first (handles schema migration from old unique courseId index)
  try {
    await Test.collection.dropIndexes();
    console.log('[SeedTests] ↩ Dropped stale indexes on tests collection');
  } catch (e) {
    // Ignore — might not exist
  }

  const [delMods, delLessons, delTests] = await Promise.all([
    Module.deleteMany({ courseId }),
    Lesson.deleteMany({ courseId }),
    Test.deleteMany({ courseId }),
  ]);
  if (delMods.deletedCount || delLessons.deletedCount || delTests.deletedCount)
    console.log(
      `[SeedTests] Cleared ${delMods.deletedCount} modules, ${delLessons.deletedCount} lessons, ${delTests.deletedCount} tests`
    );

  // 3. Create modules + lessons + tests
  let totalLessons = 0;
  let totalTests = 0;

  for (const modData of MODULE_DATA) {
    // Create module
    const mod = await Module.create({
      courseId,
      moduleNumber: modData.moduleNumber,
      title: modData.title,
      order: modData.order,
    });

    // Create lessons for this module
    for (const l of modData.lessons) {
      await Lesson.create({
        courseId,
        moduleId: mod._id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        duration: l.duration,
        videoUrl: DEMO_VIDEO,
        order: l.order,
        overview: [
          `In this lesson you will explore "${l.title}" with hands-on examples.`,
          `By the end you will understand how to apply this concept in real-world projects.`,
        ],
        takeaways: [
          { title: 'Core Concept', desc: `Understand the fundamentals of ${l.title.toLowerCase()}` },
          { title: 'Practical Application', desc: 'Apply knowledge through guided exercises' },
        ],
      });
      totalLessons++;
    }

    // Create module test (if configured)
    if (modData.testConfig) {
      await Test.create({
        courseId,
        moduleId: mod._id,
        title: modData.testConfig.title,
        timeLimitMinutes: modData.testConfig.timeLimitMinutes,
        passingScore: modData.testConfig.passingScore,
        isOptional: modData.testConfig.isOptional,
        questions: modData.testConfig.questions,
      });
      totalTests++;
      const badge = modData.testConfig.isOptional ? '(Optional)' : '(Required)';
      console.log(
        `[SeedTests] ✓ ${modData.moduleNumber} "${modData.title}" — ${modData.lessons.length} videos + 1 test ${badge}`
      );
    } else {
      console.log(
        `[SeedTests] ✓ ${modData.moduleNumber} "${modData.title}" — ${modData.lessons.length} videos, no test`
      );
    }
  }

  // 4. Final certification exam
  await Test.create({
    courseId,
    // moduleId intentionally omitted — null = final exam
    title: `${DEMO_TITLE} — Final Certification Exam`,
    timeLimitMinutes: 30,
    passingScore: 70,
    isOptional: false,
    questions: FINAL_EXAM_QUESTIONS,
  });
  totalTests++;

  // 5. Summary
  console.log('\n[SeedTests] ─── Summary ───────────────────────────');
  console.log(`[SeedTests] 🎉 Seed complete!`);
  console.log(`[SeedTests]    Course:   "${DEMO_TITLE}" (FREE)`);
  console.log(`[SeedTests]    Modules:  ${MODULE_DATA.length}`);
  console.log(`[SeedTests]    Lessons:  ${totalLessons} (3 per module)`);
  console.log(`[SeedTests]    Tests:    ${totalTests} (M1 required, M2 optional, M3 required, M4 none, Final)`);
  console.log(`[SeedTests]    Course ID: ${courseId}`);
  console.log('[SeedTests] ─────────────────────────────────────────\n');
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].includes('seedTestData')) {
  seedTestData()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[SeedTests] Fatal error:', err?.message || err);
      await disconnectDatabase();
      process.exit(1);
    });
}
