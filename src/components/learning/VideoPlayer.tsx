"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lesson, Course } from "@/types";

interface VideoPlayerProps {
  lesson: Lesson;
  course: Course;
  moduleNumber: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  course,
  moduleNumber,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");
  const [isMuted, setIsMuted] = useState(false);
  const [ccEnabled, setCcEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoSrc = lesson.videoUrl || course.previewVideoUrl || "";

  // When lesson changes, reset playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [lesson._id]);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  };

  const updateDuration = () => {
    if (
      videoRef.current &&
      !isNaN(videoRef.current.duration) &&
      isFinite(videoRef.current.duration)
    ) {
      setTotalDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if ((!totalDuration || isNaN(totalDuration)) && videoRef.current.duration) {
        updateDuration();
      }
    }
  };

  const handleLoadedMetadata = () => {
    updateDuration();
  };

  // Speed options cycle
  const speeds = ["1.0x", "1.25x", "1.5x", "2.0x"];
  const handleSpeedCycle = () => {
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(newSpeed);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleRewind = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
  };

  const handleForward = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration || 0,
      videoRef.current.currentTime + seconds
    );
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = fraction * totalDuration;
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-800 flex flex-col justify-between group select-none"
    >
      {/* Actual HTML5 Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        playsInline
        preload="metadata"
        onClick={handlePlayToggle}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header Overlay */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-label-sm text-label-sm">
          <span>
            {moduleNumber} • Lesson {lesson.lessonNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-white/80 font-mono text-[11px]">
            4K UHD
          </span>
          <span className="px-2.5 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-emerald-400 font-label-sm text-label-sm font-semibold">
            BSTORM Player v3.2
          </span>
        </div>
      </div>

      {/* Center Floating Play/Pause Trigger */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          isPlaying ? "opacity-0 group-hover:opacity-90" : "opacity-100"
        }`}
      >
        <button
          onClick={handlePlayToggle}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="w-20 h-20 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm pointer-events-auto cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <span
            className="material-symbols-outlined text-[42px] ml-1"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </div>

      {/* Instructor Floating Card */}
      <div
        className={`relative z-10 self-end mr-6 mb-2 flex items-center gap-3 bg-black/75 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-lg pointer-events-none transition-opacity duration-300 ${
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={course.instructor.name}
          className="w-10 h-10 rounded-lg object-cover ring-1 ring-emerald-500/40"
          src={course.instructor.avatar}
        />
        <div className="flex flex-col pr-2">
          <span className="text-white text-xs font-semibold leading-tight">
            {course.instructor.name}
          </span>
          <span className="text-white/60 text-[11px] leading-tight">
            Course Instructor • Video Lesson
          </span>
        </div>
      </div>

      {/* Custom Video Player Controls Overlay (Bottom) */}
      <div
        className={`relative z-20 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 py-3 flex flex-col gap-2 transition-opacity duration-200 ${
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      >
        {/* Timeline scrub bar */}
        <div
          onClick={handleTimelineClick}
          className="w-full flex items-center gap-2 group/timeline cursor-pointer py-1"
        >
          <div className="relative w-full h-1.5 bg-white/20 rounded-full group-hover/timeline:h-2.5 transition-all overflow-visible">
            {/* Played progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full flex items-center justify-end"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md transform translate-x-1.5 opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Bottom bar control buttons */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={handlePlayToggle}
              className="p-1 hover:text-emerald-400 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => handleRewind(10)}
              className="p-1 hover:text-emerald-400 transition-colors"
              title="Rewind 10s"
            >
              <span className="material-symbols-outlined text-[22px]">
                replay_10
              </span>
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => handleForward(10)}
              className="p-1 hover:text-emerald-400 transition-colors"
              title="Forward 10s"
            >
              <span className="material-symbols-outlined text-[22px]">
                forward_10
              </span>
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleMuteToggle}
                className="p-1 hover:text-emerald-400 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isMuted ? "volume_off" : "volume_up"}
                </span>
              </button>
            </div>

            {/* Time Timestamp */}
            <span className="font-mono text-xs text-white/80 ml-1">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Right Player Controls */}
          <div className="flex items-center gap-3">
            {/* Playback Speed */}
            <button
              onClick={handleSpeedCycle}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider font-mono transition-colors"
              title="Change playback rate"
            >
              {playbackSpeed}
            </button>

            {/* Captions CC */}
            <button
              onClick={() => setCcEnabled(!ccEnabled)}
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                ccEnabled ? "bg-emerald-600 text-white" : "bg-white/10 text-white/60"
              }`}
              title="Subtitles Toggle"
            >
              CC
            </button>

            {/* Quality Pill */}
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-white/90">
              4K UHD
            </span>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreenToggle}
              className="p-1 hover:text-emerald-400 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
