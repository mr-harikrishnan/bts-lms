export type CourseCategory =
  | "All Tracks"
  | "Digital Marketing"
  | "Content Creation"
  | "Web Development"
  | (string & {});

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

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
  order?: number;
}

export interface CourseModule {
  _id: string;
  courseId?: string;
  moduleNumber: string; // e.g. "Module 01"
  title: string;
  order?: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  category: string;
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
  role?: "student" | "admin";
  college: string;
  district: string;
  state: string;
  gender?: string;
  rollNumber: string;
  grantName: string;
  avatar: string;
  isLoggedIn: boolean;
  password?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: Array<{
    _id: string;
    userId?: { _id: string; name: string; email: string; avatar?: string };
    courseId?: { _id: string; title: string; category: string; price: number; thumbnail?: string };
    progress: number;
    isCompleted: boolean;
    createdAt: string;
  }>;
}

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  college?: string;
  district?: string;
  state?: string;
  rollNumber?: string;
  createdAt: string;
}

export interface AdminEnrollmentItem {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string; price: number; category: string };
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface AdminPaymentItem {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string };
  orderId: string;
  amount: number;
  currency: string;
  status: "authorized" | "captured" | "failed" | "refunded";
  razorpayPaymentId?: string;
  createdAt: string;
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
  _id?: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  type?: "mcq" | "msq";
  correctIndex?: number;
  correctIndices?: number[];
  explanation: string;
}

export interface PublicTestQuestion {
  _id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  type?: "mcq" | "msq";
}

export interface CourseTest {
  _id?: string;
  courseId: string;
  moduleId?: string | null;
  title: string;
  timeLimitMinutes: number;
  passingScore: number; // e.g. 70
  isOptional?: boolean;
  questions: TestQuestion[];
}

export interface PublicCourseTest {
  _id?: string;
  courseId: string;
  moduleId?: string | null;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  isOptional?: boolean;
  questions: PublicTestQuestion[];
}

export interface CourseProgressSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface TestSubmissionRequest {
  answers: Record<string, number | number[]>; // question _id -> selected index (MCQ) or array of indices (MSQ)
}

export interface TestQuestionFeedback {
  questionId: string;
  correct: boolean;
  explanation: string;
  type?: "mcq" | "msq";
  correctIndex?: number;
  correctIndices?: number[];
}

export interface TestSubmissionResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  certificate?: Certificate;
  feedback?: TestQuestionFeedback[];
  isModuleTest?: boolean;
  moduleId?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
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
  categories?: string[];
  level?: string;
  duration?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'course_new' | 'ticket_reply' | 'system';
  courseId?: { _id: string; title: string; category?: string; thumbnail?: string; price?: number } | string | null;
  ticketId?: string;
  isRead: boolean;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface TicketReplyItem {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  message: string;
  createdAt: string;
}

export interface TicketItem {
  _id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  replies: TicketReplyItem[];
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CouponDiscountType = 'fixed' | 'amount' | 'percentage';

export interface CouponItem {
  _id: string;
  code: string;
  courseId: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  coupon?: {
    _id: string;
    code: string;
    courseId: string;
    discountType: CouponDiscountType;
    discountValue: number;
  };
  discountType: CouponDiscountType;
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  isFree: boolean;
  message: string;
}

