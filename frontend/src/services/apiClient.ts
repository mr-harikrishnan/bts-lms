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
  AdminStats,
  AdminUserItem,
  AdminEnrollmentItem,
  AdminPaymentItem,
  CategoryItem,
  NotificationItem,
  TicketItem,
} from "@/types";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:5000/api/v1";

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
      normalized.includes("/auth/logout") ||
      (normalized.includes("/auth/me") && !memoryAccessToken);

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

export const categoryService = {
  async getAll(): Promise<CategoryItem[]> {
    const result = await request<CategoryItem[]>("/categories");
    return Array.isArray(result) ? result : [];
  },

  async create(data: { name: string; slug?: string; description?: string }): Promise<CategoryItem> {
    return request<CategoryItem>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(categoryId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/categories/${categoryId}`, {
      method: "DELETE",
    });
  },
};

export const courseService = {
  async getAll(params?: CourseFilterParams): Promise<Course[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.category) query.set("category", params.category);
      if (params.categories && params.categories.length > 0) {
        query.set("categories", params.categories.join(","));
      }
      if (params.level) query.set("level", params.level);
      if (params.duration) query.set("duration", params.duration);
      if (params.search) query.set("search", params.search);
      if (params.sort) query.set("sort", params.sort);
      if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
      if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
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

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return request<AdminStats>("/admin/stats");
  },

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<{ users: AdminUserItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    const qs = query.toString();
    return request<{ users: AdminUserItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/admin/users${qs ? `?${qs}` : ""}`
    );
  },

  async createUser(payload: {
    name: string;
    email: string;
    password: string;
    role?: "student" | "admin";
    college?: string;
    district?: string;
    state?: string;
    rollNumber?: string;
  }): Promise<AdminUserItem> {
    return request<AdminUserItem>("/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateUserRole(userId: string, role: "student" | "admin"): Promise<AdminUserItem> {
    return request<AdminUserItem>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async updateUser(userId: string, payload: Partial<AdminUserItem> & { password?: string }): Promise<AdminUserItem> {
    return request<AdminUserItem>(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    return request<Course>("/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createCourseWithCurriculum(data: any): Promise<{ course: Course; modules: CourseModule[] }> {
    return request<{ course: Course; modules: CourseModule[] }>("/admin/courses/with-curriculum", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async probeVideoDuration(videoUrl: string): Promise<{ durationSeconds: number; formatted: string }> {
    return request<{ durationSeconds: number; formatted: string }>("/admin/courses/probe-video", {
      method: "POST",
      body: JSON.stringify({ videoUrl }),
    });
  },

  async updateCourse(courseId: string, data: Partial<Course>): Promise<Course> {
    return request<Course>(`/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(courseId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/courses/${courseId}`, {
      method: "DELETE",
    });
  },

  async getEnrollments(params: { page?: number; limit?: number } = {}): Promise<{
    enrollments: AdminEnrollmentItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    const qs = query.toString();
    return request<{
      enrollments: AdminEnrollmentItem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/enrollments${qs ? `?${qs}` : ""}`);
  },

  async grantEnrollment(payload: { userId?: string; userEmail?: string; courseId: string }): Promise<any> {
    return request("/admin/enrollments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async revokeEnrollment(enrollmentId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
  },

  async getPayments(params: { page?: number; limit?: number } = {}): Promise<{
    payments: AdminPaymentItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    const qs = query.toString();
    return request<{
      payments: AdminPaymentItem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/payments${qs ? `?${qs}` : ""}`);
  },

  async processRefund(paymentId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/payments/${paymentId}/refund`, {
      method: "POST",
    });
  },
};

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    const result = await request<NotificationItem[]>("/notifications");
    return Array.isArray(result) ? result : [];
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>("/notifications/read-all", {
      method: "POST",
    });
  },

  async delete(notificationId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },
};

export const ticketService = {
  async create(data: { subject: string; description: string; priority?: string }): Promise<TicketItem> {
    return request<TicketItem>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyTickets(): Promise<TicketItem[]> {
    const result = await request<TicketItem[]>("/tickets");
    return Array.isArray(result) ? result : [];
  },

  async getById(ticketId: string): Promise<TicketItem> {
    return request<TicketItem>(`/tickets/${ticketId}`);
  },

  async reply(ticketId: string, message: string): Promise<TicketItem> {
    return request<TicketItem>(`/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  async getAllAdmin(status?: string): Promise<TicketItem[]> {
    const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    const result = await request<TicketItem[]>(`/admin/tickets${qs}`);
    return Array.isArray(result) ? result : [];
  },

  async replyAdmin(ticketId: string, message: string): Promise<TicketItem> {
    return request<TicketItem>(`/admin/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  async updateStatus(ticketId: string, status: string): Promise<TicketItem> {
    return request<TicketItem>(`/admin/tickets/${ticketId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};



