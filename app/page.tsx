"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CloudRain,
  Heart,
  MapPin,
  Music,
  Send,
  Sparkles,
  Umbrella,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TARGET_DATE = new Date("2025-12-25T00:00:00+09:00");
const EXCHANGE_RATE = 980;

const scratchMessages = [
  "커피 쿠폰 당첨! (캡처해서 보내줘)",
  "사랑해 ❤️",
  "오늘도 네가 최고야 ✨",
  "다음 만남은 별빛 데이트!",
];

function useClock(timeZone: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone,
      }),
    [timeZone]
  );

  return {
    time: formatter.format(now),
    hour: Number(
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        hour12: false,
        timeZone,
      }).format(now)
    ),
  };
}

function getGreeting(seoulHour: number, vancouverHour: number) {
  if (seoulHour >= 22 || seoulHour < 6) {
    return "잘 자, 내 꿈 꿔 🌙";
  }
  if (vancouverHour >= 6 && vancouverHour < 12) {
    return "좋은 아침이야, 오늘도 힘내 ☀️";
  }
  if (seoulHour >= 12 && seoulHour < 18) {
    return "점심 먹었어? 네 생각뿐이야 🍱";
  }
  if (seoulHour >= 18 && seoulHour < 22) {
    return "오늘 하루도 고생했어 🌆";
  }
  return "우린 언제나 같은 하늘 아래 🌌";
}

function getCountdown(target: Date) {
  const diff = target.getTime() - new Date().getTime();
  const total = Math.max(diff, 0);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function FadeInSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      className="px-5 py-6"
    >
      {children}
    </motion.section>
  );
}

function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message] = useState(
    () => scratchMessages[Math.floor(Math.random() * scratchMessages.length)]
  );
  const scratches = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const { width } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = 140;
      context.fillStyle = "#f7cac9";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = "destination-out";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.beginPath();
    context.arc(x, y, 18, 0, Math.PI * 2);
    context.fill();

    scratches.current += 1;
    if (scratches.current > 45) {
      setRevealed(true);
    }
  };

  return (
    <div className="relative rounded-3xl border border-rose/40 bg-white/60 p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm text-rose">
        <Sparkles className="h-4 w-4" />
        <span>스크래치로 행운 메시지를 열어줘</span>
      </div>
      <div className="mt-4 flex h-[140px] items-center justify-center rounded-2xl bg-white/80 text-lg font-semibold text-slate-700">
        {message}
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="scratch-canvas absolute inset-x-6 bottom-6 top-16 rounded-2xl"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            scratch(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            scratch(event);
          }}
        />
      )}
      {revealed && (
        <p className="mt-4 text-center text-xs text-slate-500">
          캡처해서 공유하면 오늘 운이 두 배!
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const seoul = useClock("Asia/Seoul");
  const vancouver = useClock("America/Vancouver");
  const greeting = getGreeting(seoul.hour, vancouver.hour);
  const [bgmOn, setBgmOn] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(TARGET_DATE));
  const [krw, setKrw] = useState("10000");
  const [cad, setCad] = useState((Number(krw) / EXCHANGE_RATE).toFixed(2));
  const [loveLevel, setLoveLevel] = useState(72);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(TARGET_DATE)), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateKrw = (value: string) => {
    setKrw(value);
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    setCad((numeric / EXCHANGE_RATE).toFixed(2));
  };

  const updateCad = (value: string) => {
    setCad(value);
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    setKrw(Math.round(numeric * EXCHANGE_RATE).toString());
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-2 pb-16">
      <header className="px-5 pt-8">
        <div className="glass flex items-center justify-between rounded-3xl px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Long Distance Love
            </p>
            <h1 className="text-2xl font-semibold text-slate-800">Our Galaxy 🚀</h1>
          </div>
          <button
            type="button"
            onClick={() => setBgmOn((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-rose/40 text-slate-700 shadow-soft transition hover:scale-105"
            aria-label="배경 음악 토글"
          >
            {bgmOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <FadeInSection>
        <div className="glass rounded-3xl px-5 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/70 p-4 text-center">
              <p className="text-xs text-slate-400">서울</p>
              <p className="mt-2 text-2xl font-semibold text-slate-700">{seoul.time}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 text-center">
              <p className="text-xs text-slate-400">밴쿠버</p>
              <p className="mt-2 text-2xl font-semibold text-slate-700">
                {vancouver.time}
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-base font-medium text-slate-600">
            {greeting}
          </p>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.05}>
        <div className="glass rain-container rounded-3xl p-6">
          <div className="flex items-center gap-2 text-slate-700">
            <CloudRain className="h-5 w-5 text-serenity" />
            <h2 className="text-lg font-semibold">Raincouver Mode</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            밴쿠버 현재 날씨: 비가 촉촉하게 내려요.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/70 p-4">
            <Umbrella className="h-6 w-6 text-serenity" />
            <span className="text-sm font-medium text-slate-600">
              우산 챙겼어? ☔️
            </span>
          </div>
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className="rain-drop"
              style={{
                left: `${index * 6 + 4}%`,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <div className="glass rounded-3xl px-6 py-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Heart className="h-5 w-5 text-rose" />
            <h2 className="text-lg font-semibold">Love D-Day</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            2025년 12월 25일까지 남은 시간
          </p>
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            {([
              { label: "일", value: countdown.days },
              { label: "시", value: countdown.hours },
              { label: "분", value: countdown.minutes },
              { label: "초", value: countdown.seconds },
            ] as const).map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/70 p-3">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={item.value}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    className="text-xl font-semibold text-slate-700"
                  >
                    {item.value.toString().padStart(2, "0")}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <ScratchCard />
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <div className="glass rounded-3xl px-6 py-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Music className="h-5 w-5 text-serenity" />
            <h2 className="text-lg font-semibold">러브 리듬</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            오늘 우리의 감정 온도는 몇 도일까?
          </p>
          <div className="mt-4 rounded-2xl bg-white/70 p-4">
            <input
              type="range"
              min={0}
              max={100}
              value={loveLevel}
              onChange={(event) => setLoveLevel(Number(event.target.value))}
              className="w-full accent-rose"
            />
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>포근해</span>
              <span className="text-base font-semibold text-rose">
                {loveLevel}%
              </span>
              <span>심쿵해</span>
            </div>
            <p className="mt-2 text-center text-sm text-slate-600">
              오늘도 우리의 마음은 같은 속도로 뛰는 중 💗
            </p>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.25}>
        <div className="glass rounded-3xl px-6 py-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="h-5 w-5 text-rose" />
            <h2 className="text-lg font-semibold">환율 계산기</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            기준 환율: 1 CAD ≈ {EXCHANGE_RATE.toLocaleString()} KRW
          </p>
          <div className="mt-4 grid gap-3">
            <label className="text-sm text-slate-500">
              KRW
              <input
                type="number"
                value={krw}
                onChange={(event) => updateKrw(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-rose/30 bg-white/80 px-4 py-3 text-base text-slate-700 shadow-soft focus:border-rose/60 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-500">
              CAD
              <input
                type="number"
                value={cad}
                onChange={(event) => updateCad(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-serenity/40 bg-white/80 px-4 py-3 text-base text-slate-700 shadow-soft focus:border-serenity/70 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.3}>
        <div className="glass rounded-3xl px-6 py-6">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-5 w-5 text-rose" />
            <h2 className="text-lg font-semibold">Future Map</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            우리가 함께 갈 곳을 미리 체크해두자.
          </p>
          <div className="map-placeholder mt-4 flex h-40 items-center justify-center rounded-2xl border border-white/60">
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-soft">
              <MapPin className="h-4 w-4 text-rose" />
              우리가 함께 갈 곳
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.35}>
        <div className="glass rounded-3xl px-6 py-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Send className="h-5 w-5 text-serenity" />
            <h2 className="text-lg font-semibold">Secret Letter</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            오늘 하루 어땠어? 네 마음을 공유해줘.
          </p>
          <div className="mt-4 grid gap-3">
            <textarea
              rows={4}
              placeholder="오늘의 마음을 적어줘"
              className="w-full resize-none rounded-2xl border border-rose/30 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-soft focus:border-rose/60 focus:outline-none"
            />
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02]"
            >
              <Send className="h-4 w-4" />
              전송
            </button>
          </div>
        </div>
      </FadeInSection>

      <div className="px-5">
        <div className="fade-divider" />
        <p className="mt-6 text-center text-xs text-slate-400">
          오늘도 사랑으로 연결된 우리, 별빛처럼 반짝이자 ✨
        </p>
      </div>
    </main>
  );
}
