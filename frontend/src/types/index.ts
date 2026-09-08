export type CourseCategory =
  | "All Tracks"
  | "Digital Marketing"
  | "Content Creation"
  | "Web Development";

export interface LessonTakeaway {
  title: string;
  desc: string;
}

export interface Lesson {
  _id: string;
  courseId?: string;
  moduleId?: string;
  lessonNumber: string; // e.g. "3.4"
  title: string;
  duration: string; // e.g. "24m" or "1h 10m"
  videoUrl?: string;
  overview: string[];
  takeaways: LessonTakeaway[];
}

export interface CourseModule {
  _id: string;
  courseId?: string;
  moduleNumber: string; // e.g. "Module 01"
  title: string;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  category: "Digital Marketing" | "Content Creation" | "Web Development";
  level: "Beginner-Friendly" | "Intermediate" | "Advanced";
  duration: string; // e.g. "16 Weeks (52 Hrs)"
  durationWeeks: number;
  hoursLive: number;
  lessonCount: number;
  rating: number;
  reviewsCount: number;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  originalPrice: number;
  price: number;
  discountPercent: number;
  capstoneTitle: string;
  capstoneDesc: string;
  skills: string[];
  featured?: boolean;
  isUpcoming?: boolean;
  previewVideoUrl?: string;
  videoUrl?: string;
  modules: CourseModule[];
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  college: string;
  district: string;
  state: string;
  rollNumber: string;
  grantName: string;
  avatar: string;
  isLoggedIn: boolean;
  password?: string;
}

export interface EnrolledCourseProgress {
  _id?: string;
  userId?: string;
  userEmail?: string;
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  currentLessonId: string;
  isCompleted: boolean;
  testScore?: number;
  testPassed?: boolean;
  certificateId?: string;
}

export interface Certificate {
  _id: string;
  userId?: string;
  userEmail?: string;
  courseId: string;
  courseTitle: string;
  category: string;
  studentName: string;
  issueDate: string;
  credentialId: string;
  score: number;
  grade: string;
  verificationKey: string;
  instructorName: string;
  directorName: string;
}

export interface TestQuestion {
  _id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type PublicTestQuestion = Omit<TestQuestion, "correctIndex" | "explanation">;

export interface CourseTest {
  _id?: string;
  courseId: string;
  title: string;
  timeLimitMinutes: number;
  passingScore: number; // e.g. 70
  questions: TestQuestion[];
}

export interface PublicCourseTest {
  _id?: string;
  courseId: string;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: PublicTestQuestion[];
}

export interface CourseProgressSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface TestSubmissionRequest {
  answers: Record<string, number>; // question _id -> selectedOptionIndex
}

export interface TestSubmissionResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  certificate?: Certificate;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export interface CourseFilterParams {
  category?: string;
  level?: string;
  duration?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}

