import { CourseTest } from "@/types";

// Import assessment data directly from course folders
import fullStackAssessment from "./courses/full-stack-web-dev/assessment.json";
import performanceMarketingAssessment from "./courses/performance-marketing/assessment.json";
import commercialVideoAssessment from "./courses/commercial-video-production/assessment.json";

export const COURSE_TESTS: Record<string, CourseTest> = {
  "full-stack-web-dev": fullStackAssessment as unknown as CourseTest,
  "performance-marketing": performanceMarketingAssessment as unknown as CourseTest,
  "commercial-video-production": commercialVideoAssessment as unknown as CourseTest,
};
