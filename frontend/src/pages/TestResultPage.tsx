import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { userService } from "@/services/apiClient";
import { Certificate } from "@/types";
import { fireConfettiBlast } from "@/components/checkout/EnrollmentSuccessModal";

// ─── Certificate Download Helper (High-Res Canvas Export) ─────────────────────

function downloadCertificateImage(
  studentName: string,
  courseTitle: string,
  score: number,
  grade: string,
  credentialId: string,
  issueDate: string,
  instructorName = "Karthik Raja"
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1130;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Decorative Borders
  ctx.strokeStyle = "#047857"; // Emerald-700
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  ctx.strokeStyle = "#10b981"; // Emerald-500
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

  // Corner Accents
  ctx.strokeStyle = "#059669";
  ctx.lineWidth = 4;
  // Top-left
  ctx.strokeRect(52, 52, 50, 50);
  // Top-right
  ctx.strokeRect(canvas.width - 102, 52, 50, 50);
  // Bottom-left
  ctx.strokeRect(52, canvas.height - 102, 50, 50);
  // Bottom-right
  ctx.strokeRect(canvas.width - 102, canvas.height - 102, 50, 50);

  // Header Branding
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 44px 'Outfit', -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DLABS · BRAINSTORM CREATORS", canvas.width / 2, 140);

  ctx.fillStyle = "#059669";
  ctx.font = "bold 18px 'Outfit', -apple-system, sans-serif";
  ctx.fillText("OFFICIAL CERTIFICATE OF COMPLETION & MASTERY", canvas.width / 2, 180);

  ctx.fillStyle = "#64748b";
  ctx.font = "24px sans-serif";
  ctx.fillText("This credential certifies that", canvas.width / 2, 275);

  // Student Name
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 56px 'Outfit', -apple-system, sans-serif";
  ctx.fillText(studentName, canvas.width / 2, 360);

  // Underline for name
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 280, 390);
  ctx.lineTo(canvas.width / 2 + 280, 390);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "24px sans-serif";
  ctx.fillText(
    "has successfully completed all required curriculum modules and passed the final certification exam for",
    canvas.width / 2,
    460
  );

  // Course Title
  ctx.fillStyle = "#047857";
  ctx.font = "bold 46px 'Outfit', -apple-system, sans-serif";
  ctx.fillText(courseTitle, canvas.width / 2, 535);

  // Score Badge
  ctx.fillStyle = "#ecfdf5";
  ctx.fillRect(canvas.width / 2 - 220, 580, 440, 54);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 220, 580, 440, 54);

  ctx.fillStyle = "#065f46";
  ctx.font = "bold 22px 'Outfit', -apple-system, sans-serif";
  ctx.fillText(`Graduated with ${grade} (${score}%)`, canvas.width / 2, 615);

  // Bottom Line Separator
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 840);
  ctx.lineTo(1500, 840);
  ctx.stroke();

  // Instructor
  ctx.fillStyle = "#0f172a";
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText(instructorName, 320, 915);
  ctx.font = "bold 17px sans-serif";
  ctx.fillText("Lead Principal Instructor", 320, 948);

  // Verified Seal
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 920, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 920, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("VERIFIED", canvas.width / 2, 916);
  ctx.font = "11px sans-serif";
  ctx.fillText("DLABS SEAL", canvas.width / 2, 938);

  // Academic Director
  ctx.fillStyle = "#0f172a";
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText("Dr. Arvind Swaminathan", 1280, 915);
  ctx.font = "bold 17px sans-serif";
  ctx.fillText("Director of Academic Affairs", 1280, 948);

  // Footer Metadata
  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Credential ID: ${credentialId}`, 100, 1040);
  ctx.textAlign = "right";
  ctx.fillText(`Issued: ${issueDate} · dlabs.edu/verify`, 1500, 1040);

  // Trigger File Download
  const link = document.createElement("a");
  const cleanTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.download = `${cleanName}_${cleanTitle}_Certificate.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Main Content Component ───────────────────────────────────────────────────

function TestResultContent({ courseId }: { courseId: string }) {
  const [searchParams] = useSearchParams();
  const { courses, getCertificateByCourseId, user } = useBstorm();
  const course = courses.find((c) => c._id === courseId);

  const [apiCert, setApiCert] = useState<Certificate | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const score = searchParams.get("score") ? Number(searchParams.get("score")) : 94;
  const passed =
    searchParams.get("passed") !== null
      ? searchParams.get("passed") === "true"
      : score >= 70;

  const grade = score >= 90 ? "Honors" : "Pass";
  const contextCert = course ? getCertificateByCourseId(course._id) : undefined;
  const certificate = contextCert || apiCert;

  const credentialId =
    certificate?.credentialId ||
    `DLABS-${new Date().getFullYear()}-${courseId.slice(-4).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

  const issueDate =
    certificate?.issueDate ||
    new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const studentName = certificate?.studentName || user.name || "Hari";
  const instructorName = certificate?.instructorName || course?.instructor?.name || "Karthik Raja";

  // Trigger confetti & show modal when passed
  useEffect(() => {
    if (passed) {
      fireConfettiBlast();
      setShowCongratsModal(true);
    }
  }, [passed]);

  // Load verified certificate from API if not yet in context
  useEffect(() => {
    if (!contextCert && passed && course) {
      userService
        .getCertificates()
        .then((certs) => {
          const match = certs.find((c) => c.courseId === course._id);
          if (match) setApiCert(match);
        })
        .catch(console.error);
    }
  }, [course, contextCert, passed]);

  const handleDownloadCertificate = () => {
    if (!course) return;
    setIsDownloading(true);
    try {
      downloadCertificateImage(
        studentName,
        course.title,
        score,
        grade,
        credentialId,
        issueDate,
        instructorName
      );
    } catch (err) {
      console.error("Certificate download failed:", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  if (!course) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-[48px] text-outline">
          search_off
        </span>
        <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
          Course Not Found
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
          The test result you are looking for belongs to an unrecognized course.
        </p>
        <Link
          to="/courses"
          className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 max-w-2xl mx-auto">

      {/* ── CONGRATULATIONS POPUP MODAL (When Test is Passed) ─────────────── */}
      {showCongratsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-emerald-200 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Header pattern banner */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* Close button */}
            <button
              onClick={() => setShowCongratsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-surface-container-low transition-colors"
              title="Close popup"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg ring-8 ring-emerald-50 mb-4 mt-2">
              <span
                className="material-symbols-outlined text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
            </div>

            {/* Title */}
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
              Assessment Passed 🎉
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Congratulations, {studentName}!
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              You have successfully passed the final certification assessment for{" "}
              <strong className="text-slate-900">{course.title}</strong>.
            </p>

            {/* Score & Status Highlight */}
            <div className="w-full bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 my-5 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Final Score
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {score}%
                </span>
              </div>
              <div className="w-px h-8 bg-emerald-200" />
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Course Status
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Completed
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  handleDownloadCertificate();
                }}
                disabled={isDownloading}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDownloading ? "hourglass_empty" : "download"}
                </span>
                <span>
                  {isDownloading ? "Downloading Certificate..." : "Download Your Certificate"}
                </span>
              </button>

              <button
                onClick={() => setShowCongratsModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-medium text-xs border border-[#E5E7EB] transition-colors"
              >
                View Detailed Score Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETION CARD (Main Page) ─────────────────────────────────── */}
      <div className="w-full bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-8 sm:p-10 shadow-sm flex flex-col items-center text-center gap-6">

        {/* Status Badge Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
            passed
              ? "bg-secondary-container text-on-secondary-fixed ring-4 ring-secondary-container/50"
              : "bg-error-container text-on-error-container ring-4 ring-error-container/50"
          }`}
        >
          <span
            className="material-symbols-outlined text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {passed ? "workspace_premium" : "sentiment_dissatisfied"}
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center justify-center gap-1.5 mb-1">
            <span
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold ${
                passed
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {passed ? "Course Completed ✓ · Certified" : "Assessment Incomplete"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {passed ? `Congratulations, ${studentName}!` : "Keep Pushing Forward!"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            {passed
              ? `You have shown practical mastery in ${course.title} and earned your verified industry credential.`
              : `You scored ${score}%. The minimum passing score is 70%. Review the video lessons and retake the assessment when ready.`}
          </p>
        </div>

        {/* Score Breakdown Metrics Card */}
        <div className="w-full grid grid-cols-3 gap-3 bg-surface-container-low p-5 rounded-xl border border-surface-container">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              Your Score
            </span>
            <span
              className={`font-headline-md text-headline-md font-bold ${
                passed ? "text-emerald-700" : "text-error"
              }`}
            >
              {score}%
            </span>
          </div>

          <div className="flex flex-col border-x border-surface-container">
            <span className="font-caption text-caption text-on-surface-variant">
              Required
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              70%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              Academic Grade
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              {passed ? grade : "Needs Review"}
            </span>
          </div>
        </div>

        {/* Credential Metadata Box (When Passed) */}
        {passed && (
          <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            <span className="truncate">ID: {credentialId}</span>
            <span className="shrink-0 text-emerald-700 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Verified Credential
            </span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          {passed ? (
            <>
              {/* Primary: Download Your Certificate */}
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-md text-label-md font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDownloading ? "hourglass_empty" : "download"}
                </span>
                <span>
                  {isDownloading ? "Downloading..." : "Download Your Certificate"}
                </span>
              </button>

              {/* View Full Certificate */}
              <Link
                to={certificate ? `/certificates/${certificate._id}` : "/certificates"}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container border border-[#E5E7EB] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>
                <span>View Certificate</span>
              </Link>

              {/* Return to My Courses */}
              <Link
                to="/my-courses"
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-surface-container-low text-slate-700 font-label-md text-label-md font-medium hover:bg-surface-container border border-[#E5E7EB] transition-all flex items-center justify-center gap-1.5"
                title="Return to My Courses"
              >
                <span>My Courses</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/test/${course._id}`}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  replay
                </span>
                <span>Retake Test</span>
              </Link>

              <Link
                to={`/courses/${course._id}/learn`}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container border border-[#E5E7EB] transition-all flex items-center justify-center gap-2"
              >
                <span>Review Lessons</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const TestResultPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  if (!courseId) return null;

  return (
    <AuthGuard>
      <AppShell>
        <TestResultContent courseId={courseId} />
      </AppShell>
    </AuthGuard>
  );
};
