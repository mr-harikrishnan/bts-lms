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
  CourseFilterParams,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// In-memory access token cache for authenticated requests
let memoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  memoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

// Token refresh mutex to prevent duplicate concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Sends HttpOnly refreshToken cookie
    });

    const data = await response.json().catch(() => null);
    if (response.ok && data?.success && data?.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }

    setAccessToken(null);
    return null;
  } catch {
    setAccessToken(null);
    return null;
  }
}

interface CustomRequestInit extends RequestInit {
  _isRetry?: boolean;
}

async function request<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalized}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  // Attach Bearer token if available in memory
  if (memoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${memoryAccessToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure session and refresh cookies are included
    signal: options.signal ?? controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  // Handle Token Expiry & Automatic Silent Refresh on HTTP 401
  if (response.status === 401 && !options._isRetry) {
    const isAuthEndpoint =
      normalized.includes("/auth/login") ||
      normalized.includes("/auth/refresh") ||
      normalized.includes("/auth/logout");

    if (!isAuthEndpoint) {
      // Use existing refresh promise if already in flight, otherwise start new one
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        // Retry the failed request with fresh access token
        const retryHeaders = new Headers(options.headers || {});
        if (!retryHeaders.has("Content-Type") && options.body && typeof options.body === "string") {
          retryHeaders.set("Content-Type", "application/json");
        }
        retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

        return request<T>(endpoint, {
          ...options,
          headers: retryHeaders,
          _isRetry: true,
        });
      }
    }
  }

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
    const result = await request<{ courses?: Course[] } | Course[]>(`/courses${qs ? `?${qs}` : ""}`);
    // Support either direct array or { courses: [...] } response format
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.courses)) return result.courses;
    return [];
  },

  async getById(courseId: string): Promise<Course> {
    return request<Course>(`/courses/${courseId}`);
  },

  async getModules(courseId: string): Promise<CourseModule[]> {
    return request<CourseModule[]>(`/courses/${courseId}/modules`);
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    return request<Lesson[]>(`/courses/${courseId}/lessons`);
  },

  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    return request<Lesson>(`/courses/${courseId}/lessons/${lessonId}`);
  },

  async enroll(courseId: string): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(`/courses/${courseId}/enroll`, {
      method: "POST",
    });
  },

  async getTest(courseId: string): Promise<PublicCourseTest> {
    return request<PublicCourseTest>(`/courses/${courseId}/test`);
  },

  async submitTest(
    courseId: string,
    answers: Record<string, number>
  ): Promise<TestSubmissionResult> {
    return request<TestSubmissionResult>(`/courses/${courseId}/test/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};

export const moduleService = {
  async getById(id: string): Promise<CourseModule> {
    return request<CourseModule>(`/modules/${id}`);
  },
};

export const lessonService = {
  async getById(id: string): Promise<Lesson> {
    return request<Lesson>(`/lessons/${id}`);
  },
};

export const authService = {
  async login(email: string, password?: string): Promise<{ user: User; accessToken: string }> {
    const result = await request<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result?.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async signup(data: Partial<User>): Promise<{ user: User; accessToken: string }> {
    const result = await request<{ user: User; accessToken: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result?.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async getMe(): Promise<{ user: User | null }> {
    return request<{ user: User | null }>("/auth/me");
  },

  async refresh(): Promise<{ accessToken: string }> {
    const result = await request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
    });
    if (result?.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async logout(): Promise<{ message: string }> {
    setAccessToken(null);
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

export const userService = {
  async getProfile(): Promise<User> {
    return request<User>("/user/profile");
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    return request<User>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async getCourses(): Promise<EnrolledCourseProgress[]> {
    return request<EnrolledCourseProgress[]>("/user/courses");
  },

  async getCourseProgress(courseId: string): Promise<{
    enrollment: EnrolledCourseProgress;
    progress: CourseProgressSummary;
  }> {
    return request<{
      enrollment: EnrolledCourseProgress;
      progress: CourseProgressSummary;
    }>(`/user/courses/${courseId}/progress`);
  },

  async updateCurrentLesson(
    courseId: string,
    currentLessonId: string
  ): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(`/user/courses/${courseId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ currentLessonId }),
    });
  },

  async markLessonComplete(
    courseId: string,
    lessonId: string
  ): Promise<EnrolledCourseProgress> {
    return request<EnrolledCourseProgress>(
      `/user/courses/${courseId}/lessons/${lessonId}/complete`,
      {
        method: "POST",
      }
    );
  },

  async getCertificates(): Promise<Certificate[]> {
    return request<Certificate[]>("/user/certificates");
  },

  async getCertificateById(certificateId: string): Promise<Certificate> {
    return request<Certificate>(`/user/certificates/${certificateId}`);
  },

  async generateCertificate(courseId: string): Promise<Certificate> {
    return request<Certificate>("/user/certificates/generate", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },
};

export interface RazorpayOrderData {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  courseTitle?: string;
}

export const paymentService = {
  async createOrder(courseId: string): Promise<RazorpayOrderData> {
    return request<RazorpayOrderData>("/payments/orders", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },

  async verifyPayment(payload: {
    orderId?: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ enrollment: EnrolledCourseProgress; paymentId: string }> {
    return request<{ enrollment: EnrolledCourseProgress; paymentId: string }>(
      "/payments/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};


