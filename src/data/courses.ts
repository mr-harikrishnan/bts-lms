import { Course, EnrolledCourseProgress } from "@/types";

// Import course data directly from organized JSON files
import fullStackCourse from "./courses/full-stack-web-dev/course.json";
import performanceMarketingCourse from "./courses/performance-marketing/course.json";
import commercialVideoCourse from "./courses/commercial-video-production/course.json";
import backendGoCourse from "./courses/backend-architecture-go/course.json";
import creativeBrandCourse from "./courses/creative-direction-brand/course.json";
import dataEngCourse from "./courses/data-engineering-python/course.json";
import defaultEnrollments from "./enrollments/default-enrollments.json";

export const COURSES: Course[] = [
  fullStackCourse as unknown as Course,
  performanceMarketingCourse as unknown as Course,
  commercialVideoCourse as unknown as Course,
  backendGoCourse as unknown as Course,
  creativeBrandCourse as unknown as Course,
  dataEngCourse as unknown as Course,
];

export const DEFAULT_ENROLLED_COURSES: EnrolledCourseProgress[] =
  defaultEnrollments as unknown as EnrolledCourseProgress[];
