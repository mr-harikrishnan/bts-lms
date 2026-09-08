"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, EnrolledCourseProgress, Certificate, Course } from "@/types";
import { authService, courseService, userService } from "@/services/apiClient";

interface BstormContextType {
  user: User;
  courses: Course[];
  enrolledCourses: EnrolledCourseProgress[];
  certificates: Certificate[];
  isHydrated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  getEnrolledCourse: (courseId: string) => EnrolledCourseProgress | undefined;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  setCurrentLesson: (courseId: string, lessonId: string) => Promise<void>;
  recordTestResult: (
    courseId: string,
    score: number,
    passed: boolean,
    cert?: Certificate
  ) => Certificate | null;
  getCourseProgress: (courseId: string) => {
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
  getCertificateByCourseId: (courseId: string) => Certificate | undefined;
  getCertificateById: (certId: string) => Certificate | undefined;
  refreshData: () => Promise<void>;
}

const GUEST_USER: User = {
  name: "Guest",
  email: "",
  college: "Institution Partner",
  district: "Coimbatore",
  state: "Tamil Nadu",
  rollNumber: "BST-0000",
  grantName: "Academic Talent Grant",
  avatar:
    "https://lh3.googleusercontent.com/aida/AEtjO1U9TCa559VGVPXEorXaOd4-4F3-_yxTRkDiN4yL_rHscfc61Dv4oR6rF-Q5Q4SMHc2OiVKW4ppUavOEPI0k5rbfijrF1pDp1QYAUDcOnaN9BVLxBtRq47v7eMcqWE7eGAv5AK-_2-vhabqlwssRcL7ZzhHYRFQg21fjuWJbAUwIiCuxxGKHOITP3QvhqfDi6cdJfeH5tDbP6RoKeD5zNznQitsO7Rh6xF-n0IR0V8a4IS3RYSu34w6dLQQ",
  isLoggedIn: false,
};

const BstormContext = createContext<BstormContextType | null>(null);

export const BstormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(GUEST_USER);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const [enrollmentList, certList] = await Promise.all([
        userService.getCourses().catch(() => []),
        userService.getCertificates().catch(() => []),
      ]);
      setEnrolledCourses(enrollmentList);
      setCertificates(certList);
    } catch (e) {
      console.error("Failed to load user progress and credentials:", e);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coursesList, authStatus] = await Promise.all([
        courseService.getAll().catch(() => []),
        authService.getMe().catch(() => ({ user: null })),
      ]);

      setCourses(coursesList);

      if (authStatus.user) {
        setUser({ ...authStatus.user, isLoggedIn: true });
        await fetchUserData();
      } else {
        setUser(GUEST_USER);
        setEnrolledCourses([]);
        setCertificates([]);
      }
    } catch (e) {
      console.error("Refresh data error:", e);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, [fetchUserData]);

  // Initial API fetch on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const result = await authService.login(email, password);
      setUser({ ...result.user, isLoggedIn: true });
      await fetchUserData();
      return true;
    } catch (e) {
      console.error("Login API request failed:", e);
      return false;
    }
  };

  const signup = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const result = await authService.signup(userData);
      setUser({ ...result.user, isLoggedIn: true });
      setEnrolledCourses([]);
      setCertificates([]);
      return true;
    } catch (e) {
      console.error("Signup API request failed:", e);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout API request failed:", e);
    } finally {
      setUser(GUEST_USER);
      setEnrolledCourses([]);
      setCertificates([]);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
    } catch (e) {
      console.error("Profile update API request failed:", e);
    }
  };

  const isEnrolled = (courseId: string): boolean => {
    if (!user.isLoggedIn) return false;
    return enrolledCourses.some((item) => item.courseId === courseId);
  };

  const getEnrolledCourse = (courseId: string): EnrolledCourseProgress | undefined => {
    if (!user.isLoggedIn) return undefined;
    return enrolledCourses.find((item) => item.courseId === courseId);
  };

  const enrollCourse = async (courseId: string): Promise<void> => {
    if (!user.isLoggedIn || isEnrolled(courseId)) return;
    try {
      const newEnrollment = await courseService.enroll(courseId);
      setEnrolledCourses((prev) => {
        const filtered = prev.filter((e) => e.courseId !== courseId);
        return [...filtered, newEnrollment];
      });
    } catch (e) {
      console.error("Course enrollment API request failed:", e);
    }
  };

  const markLessonComplete = async (courseId: string, lessonId: string): Promise<void> => {
    try {
      const updated = await userService.markLessonComplete(courseId, lessonId);
      setEnrolledCourses((prev) =>
        prev.map((enrollment) =>
          enrollment.courseId === courseId ? updated : enrollment
        )
      );
    } catch (e) {
      console.error("Mark lesson complete API request failed:", e);
    }
  };

  const setCurrentLesson = async (courseId: string, lessonId: string): Promise<void> => {
    try {
      const updated = await userService.updateCurrentLesson(courseId, lessonId);
      setEnrolledCourses((prev) =>
        prev.map((enrollment) =>
          enrollment.courseId === courseId ? updated : enrollment
        )
      );
    } catch (e) {
      console.error("Update current lesson API request failed:", e);
    }
  };

  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    const totalCount =
      course?.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    if (!user.isLoggedIn) {
      return { completedCount: 0, totalCount, percentage: 0 };
    }
    const enrollment = enrolledCourses.find((e) => e.courseId === courseId);
    const completedCount = enrollment?.completedLessonIds.length || 0;
    const percentage =
      totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

    return { completedCount, totalCount, percentage };
  };

  const recordTestResult = (
    courseId: string,
    score: number,
    passed: boolean,
    cert?: Certificate
  ): Certificate | null => {
    if (cert) {
      setCertificates((prev) => {
        const filtered = prev.filter((c) => c.courseId !== courseId);
        return [cert, ...filtered];
      });
    }

    setEnrolledCourses((prev) =>
      prev.map((enrollment) => {
        if (enrollment.courseId !== courseId) return enrollment;
        return {
          ...enrollment,
          testScore: score,
          testPassed: passed,
          isCompleted: passed ? true : enrollment.isCompleted,
          certificateId: cert ? cert._id : enrollment.certificateId,
        };
      })
    );

    return cert || null;
  };

  const getCertificateByCourseId = (courseId: string): Certificate | undefined => {
    if (!user.isLoggedIn) return undefined;
    return certificates.find((c) => c.courseId === courseId);
  };

  const getCertificateById = (certId: string): Certificate | undefined => {
    return certificates.find((c) => c._id === certId || c.credentialId === certId);
  };

  const value = useMemo(
    () => ({
      user,
      courses,
      enrolledCourses: user.isLoggedIn ? enrolledCourses : [],
      certificates: user.isLoggedIn ? certificates : [],
      isHydrated,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      enrollCourse,
      isEnrolled,
      getEnrolledCourse,
      markLessonComplete,
      setCurrentLesson,
      recordTestResult,
      getCourseProgress,
      getCertificateByCourseId,
      getCertificateById,
      refreshData,
    }),
    [user, courses, enrolledCourses, certificates, isHydrated, isLoading, refreshData]
  );

  return (
    <BstormContext.Provider value={value}>{children}</BstormContext.Provider>
  );
};

export const useBstorm = () => {
  const context = useContext(BstormContext);
  if (!context) {
    throw new Error("useBstorm must be used within a BstormProvider");
  }
  return context;
};
