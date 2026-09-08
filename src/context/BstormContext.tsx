"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, EnrolledCourseProgress, Certificate, Course } from "@/types";
import { COURSES, DEFAULT_ENROLLED_COURSES } from "@/data/courses";

interface BstormContextType {
  user: User;
  courses: Course[];
  enrolledCourses: EnrolledCourseProgress[];
  certificates: Certificate[];
  isHydrated: boolean;
  login: (email: string, password?: string) => boolean;
  signup: (userData: Partial<User>) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  enrollCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getEnrolledCourse: (courseId: string) => EnrolledCourseProgress | undefined;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setCurrentLesson: (courseId: string, lessonId: string) => void;
  recordTestResult: (courseId: string, score: number, passed: boolean) => Certificate | null;
  getCourseProgress: (courseId: string) => {
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
  getCertificateByCourseId: (courseId: string) => Certificate | undefined;
  getCertificateById: (certId: string) => Certificate | undefined;
}

import defaultUserData from "@/data/users/default-user.json";
import defaultCertificatesData from "@/data/certificates/default-certificates.json";

const DEFAULT_USER: User = defaultUserData as unknown as User;

const DEFAULT_CERTIFICATES: Certificate[] = defaultCertificatesData as unknown as Certificate[];

const BstormContext = createContext<BstormContextType | null>(null);

const STORAGE_KEYS = {
  USER: "bstorm_user_v2",
  ENROLLMENTS: "bstorm_enrollments_v2",
  CERTIFICATES: "bstorm_certificates_v2",
};

export const BstormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [enrolledCourses, setEnrolledCourses] =
    useState<EnrolledCourseProgress[]>(DEFAULT_ENROLLED_COURSES);
  const [certificates, setCertificates] =
    useState<Certificate[]>(DEFAULT_CERTIFICATES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedEnrollments = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      if (savedEnrollments) {
        setEnrolledCourses(JSON.parse(savedEnrollments));
      }

      const savedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (savedCerts) {
        setCertificates(JSON.parse(savedCerts));
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.ENROLLMENTS,
        JSON.stringify(enrolledCourses)
      );
    } catch (e) {
      console.error(e);
    }
  }, [enrolledCourses, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.CERTIFICATES,
        JSON.stringify(certificates)
      );
    } catch (e) {
      console.error(e);
    }
  }, [certificates, isHydrated]);

  const login = (email: string) => {
    const updatedUser: User = {
      ...user,
      email: email || user.email,
      isLoggedIn: true,
    };
    setUser(updatedUser);
    // Ensure default enrollments are populated on login if currently empty
    if (enrolledCourses.length === 0) {
      setEnrolledCourses(DEFAULT_ENROLLED_COURSES);
    }
    if (certificates.length === 0) {
      setCertificates(DEFAULT_CERTIFICATES);
    }
    return true;
  };

  const signup = (data: Partial<User>) => {
    const updatedUser: User = {
      ...DEFAULT_USER,
      ...data,
      isLoggedIn: true,
    };
    setUser(updatedUser);
    setEnrolledCourses([]);
    setCertificates([]);
    return true;
  };

  const logout = () => {
    setUser((prev) => {
      const updated = { ...prev, isLoggedIn: false };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const isEnrolled = (courseId: string) => {
    if (!user.isLoggedIn) return false;
    return enrolledCourses.some((item) => item.courseId === courseId);
  };

  const getEnrolledCourse = (courseId: string) => {
    if (!user.isLoggedIn) return undefined;
    return enrolledCourses.find((item) => item.courseId === courseId);
  };

  const enrollCourse = (courseId: string) => {
    if (!user.isLoggedIn) return;
    if (isEnrolled(courseId)) return;
    const course = COURSES.find((c) => c.id === courseId);
    const firstLessonId = course?.modules[0]?.lessons[0]?.id || "lesson-1-1";

    const newEnrollment: EnrolledCourseProgress = {
      courseId,
      enrolledAt: new Date().toISOString().split("T")[0],
      completedLessonIds: [],
      currentLessonId: firstLessonId,
      isCompleted: false,
    };

    setEnrolledCourses((prev) => [...prev, newEnrollment]);
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setEnrolledCourses((prev) =>
      prev.map((enrollment) => {
        if (enrollment.courseId !== courseId) return enrollment;

        const updatedSet = new Set(enrollment.completedLessonIds);
        updatedSet.add(lessonId);
        const completedLessonIds = Array.from(updatedSet);

        // Find course total lessons
        const course = COURSES.find((c) => c.id === courseId);
        const totalLessons =
          course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
        const isCompleted = completedLessonIds.length >= totalLessons;

        return {
          ...enrollment,
          completedLessonIds,
          isCompleted,
        };
      })
    );
  };

  const setCurrentLesson = (courseId: string, lessonId: string) => {
    setEnrolledCourses((prev) =>
      prev.map((enrollment) => {
        if (enrollment.courseId !== courseId) return enrollment;
        return {
          ...enrollment,
          currentLessonId: lessonId,
        };
      })
    );
  };

  const getCourseProgress = (courseId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    const totalCount =
      course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
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
    passed: boolean
  ): Certificate | null => {
    if (!user.isLoggedIn) return null;
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return null;

    let generatedCert: Certificate | null = null;

    if (passed) {
      const certId = `cert-${courseId}-${Date.now()}`;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const hexKey =
        "0x" +
        Math.floor(Math.random() * 0xffffffffffff)
          .toString(16)
          .toUpperCase();

      generatedCert = {
        id: certId,
        courseId,
        courseTitle: course.title,
        category: course.category,
        studentName: user.name || "Hari",
        issueDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        credentialId: `BST-2025-${randomSuffix}-01B`,
        score,
        grade: score >= 90 ? "Honors" : "Pass",
        verificationKey: hexKey,
        instructorName: course.instructor.name,
        directorName: "Dr. Arvind Swaminathan",
      };

      setCertificates((prev) => {
        const filtered = prev.filter((c) => c.courseId !== courseId);
        return [generatedCert!, ...filtered];
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
          certificateId: generatedCert ? generatedCert.id : enrollment.certificateId,
        };
      })
    );

    return generatedCert;
  };

  const getCertificateByCourseId = (courseId: string) => {
    if (!user.isLoggedIn) return undefined;
    return certificates.find((c) => c.courseId === courseId);
  };

  const getCertificateById = (certId: string) => {
    return certificates.find((c) => c.id === certId);
  };

  const value = useMemo(
    () => ({
      user,
      courses: COURSES,
      enrolledCourses: user.isLoggedIn ? enrolledCourses : [],
      certificates: user.isLoggedIn ? certificates : [],
      isHydrated,
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
    }),
    [user, enrolledCourses, certificates, isHydrated]
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
