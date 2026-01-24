"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CloudRain,
  Heart,
  Mail,
  MapPin,
  Moon,
  Music2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Sun,
} from "lucide-react";

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
  viewport: { once: true, amount: 0.35 },
};

const bgmUrl =
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8ff3e11.mp3?filename=gentle-sunrise-112563.mp3";

const surpriseMessages = [
  "커피 쿠폰 당첨! (캡처해서 보내줘)",
  "사랑해 ❤️",
  "다음 영상통화는 네가 먼저 걸기!",
  "우리의 첫 데이트 장소 다시 가기",
];

const dailyPromises = [
  "오늘도 서로에게 따뜻한 말 한마디",
  "사진 한 장씩 공유하기",
  "오늘의 하이라이트를 음성으로 보내기",
  "서로의 하루에 별칭 붙여주기",
];

const moodTags = [
  "포근함",
  "두근두근",
  "평온함",
  "보고싶음",
  "기대감",
];

function getTimeString(timeZone: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date());
}

function getHour(timeZone: string) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(new Date())
  );
}

function getGreeting(seoulHour: number, vancouverHour: number) {
  if (seoulHour >= 22 || seoulHour < 6) {
    return "잘 자, 내 꿈 꿔 🌙";
  }
  if (vancouverHour >= 6 && vancouverHour < 11) {
    return "좋은 아침이야, 오늘도 힘내 ☀️";
  }
  if (vancouverHour >= 11 && vancouverHour < 18) {
    return "점심 챙겨 먹었어? 🌸";
  }
  return "우리 오늘도 무사히 안부 체크 💌";
}

function getRemaining(target: Date) {
  const now = new Date().getTime();
  const diff = Math.max(target.getTime() - now, 0);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [times, setTimes] = useState({
    seoul: getTimeString("Asia/Seoul"),
    vancouver: getTimeString("America/Vancouver"),
  });
  const [countdown, setCountdown] = useState(
    getRemaining(new Date("2025-12-25T00:00:00"))
  );
  const [scratchMessage] = useState(
    () => surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)]
  );
  const [promiseIndex, setPromiseIndex] = useState(0);
  const [rate, setRate] = useState(980);
  const [krw, setKrw] = useState(10000);
  const [cad, setCad] = useState(10.2);
  const [moodIndex, setMoodIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const raindrops = useMemo(
    () =>
      [...Array(18)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 40}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${1 + Math.random() * 1.4}s`,
      })),
    []
  );

  const greeting = useMemo(() => {
    const seoulHour = getHour("Asia/Seoul");
    const vancouverHour = getHour("America/Vancouver");
    return getGreeting(seoulHour, vancouverHour);
  }, [times]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimes({
        seoul: getTimeString("Asia/Seoul"),
        vancouver: getTimeString("America/Vancouver"),
      });
      setCountdown(getRemaining(new Date("2025-12-25T00:00:00")));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawCover = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const { width, height } = canvas;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#F7CAC9");
      gradient.addColorStop(1, "#92A8D1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "destination-out";
    };

    drawCover();
    window.addEventListener("resize", drawCover);
    return () => window.removeEventListener("resize", drawCover);
  }, []);

  const toggleBgm = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2, false);
    ctx.fill();
  };

  const handleRateChange = (value: number) => {
    if (!value) return;
    setRate(value);
    setCad(Number((krw / value).toFixed(2)));
  };

  const handleKrwChange = (value: number) => {
    setKrw(value);
    setCad(Number((value / rate).toFixed(2)));
  };

  const handleCadChange = (value: number) => {
    setCad(value);
    setKrw(Number((value * rate).toFixed(0)));
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 pb-24 pt-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_55%)]" />
      <header className="glass-card flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rose-400">
            Long Distance Love
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Our Galaxy 🚀
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            우리의 시간대가 겹치는 순간을 모아두는 공간
          </p>
        </div>
        <button
          type="button"
          onClick={toggleBgm}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/80 text-rose-400 shadow-soft"
          aria-label="BGM 재생"
        >
          {isPlaying ? <PauseCircle size={26} /> : <PlayCircle size={26} />}
        </button>
        <audio ref={audioRef} src={bgmUrl} loop />
      </header>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">서울</p>
            <p className="text-2xl font-semibold text-slate-800">
              {times.seoul}
            </p>
          </div>
          <div className="h-12 w-px bg-rose-100" />
          <div className="text-right">
            <p className="text-sm text-slate-500">밴쿠버</p>
            <p className="text-2xl font-semibold text-slate-800">
              {times.vancouver}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50/70 px-4 py-3 text-center text-sm text-rose-500">
          {greeting}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Sun size={14} className="text-rose-300" />
          서울 & 밴쿠버가 동시에 깨어있는 시간 체크
          <Moon size={14} className="text-serenity" />
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card relative overflow-hidden px-5 py-6"
      >
        <div className="absolute inset-0">
          {raindrops.map((drop, index) => (
            <span
              key={`drop-${index}`}
              className="raindrop"
              style={{
                left: drop.left,
                top: drop.top,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Raincouver Mode</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              오늘 밴쿠버는 비 🌧️
            </h2>
            <p className="mt-2 text-sm text-slate-600">우산 챙겼어? ☔️</p>
          </div>
          <CloudRain className="text-serenity" size={40} />
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-5 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Love D-Day</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              2025년 12월 25일까지
            </h2>
          </div>
          <Heart className="text-rose-400" size={32} />
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          {(
            [
              { label: "일", value: countdown.days },
              { label: "시", value: countdown.hours },
              { label: "분", value: countdown.minutes },
              { label: "초", value: countdown.seconds },
            ] as const
          ).map((item) => (
            <motion.div
              key={item.label}
              className="rounded-2xl bg-white/80 px-2 py-3 shadow-soft"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-2xl font-semibold text-slate-900">
                {item.value}
              </div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Lucky Scratch</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              손가락으로 살살 문질러봐
            </h2>
          </div>
          <Sparkles className="text-rose-400" size={28} />
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-rose-50/60 p-4">
          <div className="flex h-28 items-center justify-center rounded-2xl bg-white/90 text-center text-base font-medium text-rose-500">
            {scratchMessage}
          </div>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(event) => {
              isDrawing.current = true;
              handleScratch(event);
            }}
            onPointerMove={(event) => {
              if (!isDrawing.current) return;
              handleScratch(event);
            }}
            onPointerUp={() => {
              isDrawing.current = false;
            }}
            onPointerLeave={() => {
              isDrawing.current = false;
            }}
          />
        </div>
        <p className="text-xs text-slate-500">
          스크래치가 잘 안되면 천천히 문질러줘.
        </p>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">오늘의 무드</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              우리 마음 온도 체크
            </h2>
          </div>
          <Music2 className="text-serenity" size={28} />
        </div>
        <div className="flex flex-wrap gap-2">
          {moodTags.map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => setMoodIndex(index)}
              className={`rounded-full px-4 py-2 text-xs transition ${
                moodIndex === index
                  ? "bg-rose-400 text-white shadow-soft"
                  : "bg-white/80 text-slate-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-soft">
          오늘의 무드는 <span className="font-semibold">{moodTags[moodIndex]}</span>
          이야. 서로의 감정 온도를 공유해줘 💗
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">환율 계산기</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              KRW ↔ CAD
            </h2>
          </div>
          <Music2 className="text-serenity" size={28} />
        </div>
        <div className="space-y-3">
          <label className="block text-xs text-slate-500">
            1 CAD =
            <input
              type="number"
              value={rate}
              onChange={(event) => handleRateChange(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-slate-500">
              KRW
              <input
                type="number"
                value={krw}
                onChange={(event) => handleKrwChange(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700"
              />
            </label>
            <label className="block text-xs text-slate-500">
              CAD
              <input
                type="number"
                value={cad}
                onChange={(event) => handleCadChange(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700"
              />
            </label>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Future Map</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              우리가 함께 갈 곳
            </h2>
          </div>
          <MapPin className="text-rose-400" size={28} />
        </div>
        <div className="relative h-44 overflow-hidden rounded-3xl bg-gradient-to-br from-serenity/30 via-white to-rose-100">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_60%)]" />
          </div>
          <div className="absolute inset-x-4 top-4 rounded-2xl bg-white/90 px-4 py-3 text-xs text-slate-600 shadow-soft">
            추억 목록: 그랜빌 아일랜드, 스탠리 파크, 한강 산책
          </div>
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-soft">
            <MapPin size={16} className="text-rose-400" />
            우리의 로망 여행지
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Secret Letter</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              오늘 하루 어땠어?
            </h2>
          </div>
          <Mail className="text-serenity" size={28} />
        </div>
        <textarea
          placeholder="한 줄이라도 좋아, 네 마음을 남겨줘"
          className="h-28 w-full resize-none rounded-3xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700"
        />
        <button
          type="button"
          className="w-full rounded-2xl bg-rose-400 py-3 text-sm font-semibold text-white shadow-soft"
        >
          전송
        </button>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="glass-card space-y-4 px-5 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">오늘의 약속 카드</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              우리만의 작은 루틴
            </h2>
          </div>
          <Heart className="text-rose-400" size={28} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={dailyPromises[promiseIndex]}
            className="rounded-3xl bg-white/80 px-4 py-5 text-center text-base font-medium text-slate-700 shadow-soft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {dailyPromises[promiseIndex]}
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={() =>
            setPromiseIndex((prev) => (prev + 1) % dailyPromises.length)
          }
          className="w-full rounded-2xl border border-rose-200 bg-white/90 py-3 text-sm font-semibold text-rose-500"
        >
          새로운 약속 뽑기
        </button>
      </motion.section>

      <footer className="pb-10 text-center text-xs text-slate-400">
        오늘도 우리 사이에 별을 하나 더 ✨
      </footer>
    </main>
  );
}
