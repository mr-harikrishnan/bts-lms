import {
  Course,
  CourseModule,
  Lesson,
  User,
  EnrolledCourseProgress,
  Certificate,
  PublicCourseTest,
  TestSubmissionResult,
  CourseProgressSummary,
  ApiResponse,
  ApiErrorResponse,
} from "@/types";
import { CourseFilterParams } from "@/lib/data/courses";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure session cookies are sent
  });

  const data: ApiResponse<T> | ApiErrorResponse = await response.json().catch(() => ({
    success: false,
    error: { message: `Network request failed with status ${response.status}` },
  }));

  if (!data.success) {
    throw new Error(data.error?.message || "An unexpected API error occurred.");
  }

  return data.data;
}

export const courseService = {
  async getAll(params?: CourseFilterParams): Promise<Course[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.category) query.set("category", params.category);
      if (params.level) query.set("level", params.level);
      if (params.duration) query.set("duration", params.duration);
      if (params.search) query.set("search", params.search);
      if (params.sort) query.set("sort", params.sort);
      if (params.featured !== undefined) query.set("featured", String(params.featured));
    }
    const qs = query.toString();
    return request<Course[]>(`/api/courses${qs ? `?${qs}` : ""}`);
  },

  async getById(courseId: string): Promise<Course> {
    return request<Course>(`/api/courses/${courseId}`);
  },

  async getModules(courseId: string): Promise<CourseModule[]> {
    return request<CourseModule[]>(`/api/courses/${courseId}/modules`);
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    return request<Lesson[]>(`/api/courses/${courseId}/lessons`);
  },

  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    return request<Lesson>(`/api/courses/${courseId}/lessons/${lessonId}`);
  },

  async enroll(courseId: string): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(`/api/courses/${courseId}/enroll`, {
      method: "POST",
    });
  },

  async getTest(courseId: string): Promise<PublicCourseTest> {
    return request<PublicCourseTest>(`/api/courses/${courseId}/test`);
  },

  async submitTest(
    courseId: string,
    answers: Record<string, number>
  ): Promise<TestSubmissionResult> {
    return request<TestSubmissionResult>(`/api/courses/${courseId}/test/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};

export const moduleService = {
  async getById(id: string): Promise<CourseModule> {
    return request<CourseModule>(`/api/modules/${id}`);
  },
};

export const lessonService = {
  async getById(id: string): Promise<Lesson> {
    return request<Lesson>(`/api/lessons/${id}`);
  },
};

export const authService = {
  async login(email: string, password?: string): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(data: Partial<User>): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<{ user: User | null }> {
    return request<{ user: User | null }>("/api/auth/me");
  },

  async logout(): Promise<{ message: string }> {
    return request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },
};

export const userService = {
  async getProfile(): Promise<User> {
    return request<User>("/api/user/profile");
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    return request<User>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async getCourses(): Promise<EnrolledCourseProgress[]> {
    return request<EnrolledCourseProgress[]>("/api/user/courses");
  },

  async getCourseProgress(courseId: string): Promise<{
    enrollment: EnrolledCourseProgress;
    progress: CourseProgressSummary;
  }> {
    return request<{
      enrollment: EnrolledCourseProgress;
      progress: CourseProgressSummary;
    }>(`/api/user/courses/${courseId}/progress`);
  },

  async updateCurrentLesson(
    courseId: string,
    currentLessonId: string
  ): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(`/api/user/courses/${courseId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ currentLessonId }),
    });
  },

  async markLessonComplete(
    courseId: string,
    lessonId: string
  ): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(
      `/api/user/courses/${courseId}/lessons/${lessonId}/complete`,
      {
        method: "POST",
      }
    );
  },

  async getCertificates(): Promise<Certificate[]> {
    return request<Certificate[]>("/api/user/certificates");
  },

  async getCertificateById(certificateId: string): Promise<Certificate> {
    return request<Certificate>(`/api/user/certificates/${certificateId}`);
  },

  async generateCertificate(courseId: string): Promise<Certificate> {
    return request<Certificate>("/api/user/certificates/generate", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },
};
