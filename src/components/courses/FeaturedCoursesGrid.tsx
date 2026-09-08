"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Video, Code2 } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Digital Marketing": <TrendingUp className="w-3.5 h-3.5" />,
  "Content Creation": <Video className="w-3.5 h-3.5" />,
  "Web Development": <Code2 className="w-3.5 h-3.5" />,
};

export const FeaturedCoursesGrid: React.FC = () => {
  const { courses, isLoading } = useBstorm();

  // Primary 3 featured courses representing each track
  const featuredCourses = React.useMemo(() => {
    if (courses.length === 0) return [];
    const dm = courses.find((c) => c.category === "Digital Marketing") || courses[0];
    const cc = courses.find((c) => c.category === "Content Creation") || courses[1];
    const wd = courses.find((c) => c.category === "Web Development") || courses[2];
    return [dm, cc, wd].filter(Boolean);
  }, [courses]);

  if (isLoading || featuredCourses.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl border border-stone-200 h-96 overflow-hidden"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {featuredCourses.map((course) => {
        const icon = CATEGORY_ICONS[course.category] || <TrendingUp className="w-3.5 h-3.5" />;
        const totalLessons =
          course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) ||
          course.lessonCount ||
          10;

        return (
          <article
            key={course.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-xs font-semibold text-[#697C70] shadow-xs flex items-center gap-1.5">
                {icon}
                <span>{course.category}</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2D3536] group-hover:text-[#697C70] transition-colors mb-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 font-medium py-3 border-y border-stone-100">
                  <span>{totalLessons} Lessons • {course.skills?.length || 5} Skills</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                  <span>{course.durationWeeks} Weeks</span>
                </div>
              </div>

              <div className="pt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block">Tuition</span>
                  <span className="text-lg font-bold text-[#2D3536]">
                    ₹{course.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link
                  href={`/checkout/${course.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3536] text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
