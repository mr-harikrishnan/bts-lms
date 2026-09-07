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
  id: string;
  lessonNumber: string; // e.g. "3.4"
  title: string;
  duration: string; // e.g. "24m" or "1h 10m"
  videoUrl?: string;
  overview: string[];
  takeaways: LessonTakeaway[];
}

export interface CourseModule {
  id: string;
  moduleNumber: string; // e.g. "Module 01"
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
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
  modules: CourseModule[];
}

export interface User {
  name: string;
  email: string;
  college: string;
  district: string;
  state: string;
  rollNumber: string;
  grantName: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface EnrolledCourseProgress {
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
  id: string;
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
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseTest {
  courseId: string;
  title: string;
  timeLimitMinutes: number;
  passingScore: number; // e.g. 70
  questions: TestQuestion[];
}
