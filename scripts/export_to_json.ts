import fs from "fs";
import path from "path";
import { COURSES, DEFAULT_ENROLLED_COURSES } from "../src/data/courses";
import { COURSE_TESTS } from "../src/data/tests";

const baseDir = path.resolve(__dirname, "../src/data");

const DEFAULT_USER = {
  name: "Hari",
  email: "hari.prasath@example.com",
  college: "PSG College of Technology",
  district: "Coimbatore",
  state: "Tamil Nadu",
  rollNumber: "21BBA048",
  grantName: "PSG Tech Academic Grant",
  avatar:
    "https://lh3.googleusercontent.com/aida/AEtjO1U9TCa559VGVPXEorXaOd4-4F3-_yxTRkDiN4yL_rHscfc61Dv4oR6rF-Q5Q4SMHc2OiVKW4ppUavOEPI0k5rbfijrF1pDp1QYAUDcOnaN9BVLxBtRq47v7eMcqWE7eGAv5AK-_2-vhabqlwssRcL7ZzhHYRFQg21fjuWJbAUwIiCuxxGKHOITP3QvhqfDi6cdJfeH5tDbP6RoKeD5zNznQitsO7Rh6xF-n0IR0V8a4IS3RYSu34w6dLQQ",
  isLoggedIn: true,
};

const DEFAULT_CERTIFICATES = [
  {
    id: "cert-default-1",
    courseId: "performance-marketing",
    courseTitle: "Advanced Performance Marketing & Growth Systems",
    category: "Digital Marketing",
    studentName: "Hari",
    issueDate: "Feb 14, 2025",
    credentialId: "BST-2025-8849-01B",
    score: 96.4,
    grade: "Honors",
    verificationKey: "0x4F91A82C3D77E4",
    instructorName: "Pooja Venkatesh",
    directorName: "Dr. Arvind Swaminathan",
  },
];

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath: string, data: any) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log("Written:", path.relative(baseDir, filePath));
}

// 1. Export User Data
writeJson(path.join(baseDir, "users", "default-user.json"), DEFAULT_USER);

// 2. Export Enrollments
writeJson(path.join(baseDir, "enrollments", "default-enrollments.json"), DEFAULT_ENROLLED_COURSES);

// 3. Export Certificates
writeJson(path.join(baseDir, "certificates", "default-certificates.json"), DEFAULT_CERTIFICATES);

const GLOBAL_VIDEO_URL = "https://res.cloudinary.com/ddifxio8b/video/upload/v1788807587/12987350_3840_2160_30fps_doncq1.mp4";

// 4. Export Courses & Modules
for (const course of COURSES) {
  course.previewVideoUrl = GLOBAL_VIDEO_URL;
  const courseFolder = path.join(baseDir, "courses", course.id);
  ensureDir(courseFolder);

  // Assessment
  const assessment = COURSE_TESTS[course.id];
  if (assessment) {
    writeJson(path.join(courseFolder, "assessment.json"), assessment);
  }

  // Modules folder
  const modulesFolder = path.join(courseFolder, "modules");
  ensureDir(modulesFolder);

  for (const mod of course.modules) {
    // e.g. module-01 or mod-1
    const moduleSlug = mod.moduleNumber.toLowerCase().replace(/\s+/g, "-");
    const singleModuleFolder = path.join(modulesFolder, moduleSlug);
    ensureDir(singleModuleFolder);

    // Save lessons individually inside module lessons/
    const lessonsFolder = path.join(singleModuleFolder, "lessons");
    ensureDir(lessonsFolder);

    for (const lesson of mod.lessons) {
      lesson.videoUrl = GLOBAL_VIDEO_URL;
      writeJson(path.join(lessonsFolder, `${lesson.id}.json`), lesson);
    }

    // Save module metadata + lessons list
    writeJson(path.join(singleModuleFolder, "module.json"), mod);
  }

  // Save course metadata (complete course definition with embedded modules)
  writeJson(path.join(courseFolder, "course.json"), course);
}

console.log("All data successfully exported to module-wise JSON files!");
