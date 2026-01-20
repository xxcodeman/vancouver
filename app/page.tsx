"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CloudRain,
  Headphones,
  Heart,
  MapPin,
  Music2,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";

const REUNION_DATE = new Date("2026-12-25T00:00:00+09:00");
const SCRATCH_MESSAGES = [
  "커피 쿠폰 당첨! (캡처해서 보내줘)",
  "사랑해 ❤️",
  "오늘도 너 생각뿐이야",
  "하루 종일 안아주고 싶어",
];
const CAD_PER_KRW = 1 / 1000; // 임시 환율

function useClock(timeZone: string) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone,
      }),
    [timeZone]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
        timeZone,
      }),
    [timeZone]
  );

  return {
    time: formatter.format(now),
    date: dateFormatter.format(now),
    hour: Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone,
      }).format(now)
    ),
  };
}

function getGreeting(seoulHour: number, vancouverHour: number) {
  if (seoulHour >= 22 || seoulHour <= 4) {
    return "잘 자, 내 꿈 꿔 🌙";
  }
  if (vancouverHour >= 6 && vancouverHour <= 10) {
    return "좋은 아침이야, 오늘도 힘내 ☀️";
  }
  if (seoulHour >= 12 && seoulHour <= 15) {
    return "점심 맛있게 먹어 🍽️";
  }
  if (vancouverHour >= 18 && vancouverHour <= 22) {
    return "오늘 하루 고생했어 💙";
  }
  return "지금도 네 생각 중이야 ✨";
}

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const safeDiff = Math.max(diff, 0);
  const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDiff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: diff <= 0 };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState(() =>
    SCRATCH_MESSAGES[Math.floor(Math.random() * SCRATCH_MESSAGES.length)]
  );
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      ctx.fillStyle = "rgba(247, 202, 201, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px Pretendard, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("문질러서 사랑을 확인해줘", 16, 28);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setIsRevealed(false);
  }, [message]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2, false);
    ctx.fill();
  };

  const handlePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    scratch(event.clientX - rect.left, event.clientY - rect.top);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    const ratio = cleared / (imageData.data.length / 4);
    if (ratio > 0.45) setIsRevealed(true);
  };

  const reset = () => {
    setMessage(
      SCRATCH_MESSAGES[Math.floor(Math.random() * SCRATCH_MESSAGES.length)]
    );
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(247, 202, 201, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("문질러서 사랑을 확인해줘", 16, 28);
    setIsRevealed(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink/60">Lucky Scratch</p>
          <h3 className="text-lg font-semibold">오늘의 깜짝 메시지</h3>
        </div>
        <button
          onClick={reset}
          className="rounded-full border border-rose/60 bg-rose/20 px-3 py-1 text-xs"
        >
          다시하기
        </button>
      </div>
      <div className="relative mt-4 h-36 rounded-2xl bg-rose/10 p-4">
        <p className="text-lg font-semibold text-ink">{message}</p>
        <p className="mt-2 text-sm text-ink/60">스크래치 후 캡처해서 보내줘 💌</p>
        <canvas
          ref={canvasRef}
          className="scratch-canvas absolute inset-0 h-full w-full cursor-pointer rounded-2xl"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
        />
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 text-sm font-semibold"
            >
              열어줘서 고마워 💗
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExchangeCalculator() {
  const [krw, setKrw] = useState(10000);
  const [cad, setCad] = useState(() => Number((10000 * CAD_PER_KRW).toFixed(2)));

  const handleKrw = (value: number) => {
    setKrw(value);
    setCad(Number((value * CAD_PER_KRW).toFixed(2)));
  };

  const handleCad = (value: number) => {
    setCad(value);
    setKrw(Math.round(value / CAD_PER_KRW));
  };

  return (
    <div className="glass rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm text-ink/60">
        <Sparkles size={16} />
        임시 환율 기준 (1 CAD ≈ 1,000 KRW)
      </div>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-ink/60">KRW → CAD</span>
          <input
            type="number"
            value={krw}
            onChange={(e) => handleKrw(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-rose/30 bg-white/70 px-4 py-3 text-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/60">CAD → KRW</span>
          <input
            type="number"
            value={cad}
            onChange={(e) => handleCad(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-serenity/30 bg-white/70 px-4 py-3 text-lg"
          />
        </label>
      </div>
    </div>
  );
}

function MoodButtons() {
  const moods = [
    { label: "보고 싶어", emoji: "🥺" },
    { label: "설레는 중", emoji: "💓" },
    { label: "고요해", emoji: "🌙" },
    { label: "힘내자", emoji: "🌿" },
  ];
  const [selected, setSelected] = useState(moods[1]);

  return (
    <div className="glass rounded-3xl p-6 shadow-soft">
      <p className="text-sm text-ink/60">오늘의 마음 온도</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => setSelected(mood)}
            className={`rounded-2xl border px-3 py-3 text-sm transition ${
              selected.label === mood.label
                ? "border-rose/60 bg-rose/20"
                : "border-white/60 bg-white/70"
            }`}
          >
            <div className="text-xl">{mood.emoji}</div>
            <div className="mt-1 font-medium">{mood.label}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/70">"{selected.label}" 상태로 저장했어.</p>
    </div>
  );
}

export default function Home() {
  const seoul = useClock("Asia/Seoul");
  const vancouver = useClock("America/Vancouver");
  const greeting = getGreeting(seoul.hour, vancouver.hour);
  const countdown = useCountdown(REUNION_DATE);

  const [bgmOn, setBgmOn] = useState(false);

  const digits = [
    { label: "일", value: countdown.days },
    { label: "시간", value: countdown.hours },
    { label: "분", value: countdown.minutes },
    { label: "초", value: countdown.seconds },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-5 pb-24 pt-10">
      <FadeIn>
        <header className="glass flex items-center justify-between rounded-3xl px-5 py-4 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Long Distance</p>
            <h1 className="text-2xl font-semibold">Our Galaxy 🚀</h1>
          </div>
          <button
            onClick={() => setBgmOn((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-sm"
          >
            {bgmOn ? <Volume2 size={18} /> : <Headphones size={18} />}
            {bgmOn ? "ON" : "OFF"}
          </button>
        </header>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink/60">서울</p>
              <div className="text-2xl font-semibold">{seoul.time}</div>
              <p className="text-xs text-ink/60">{seoul.date}</p>
            </div>
            <div className="h-12 w-px bg-white/60" />
            <div className="text-right">
              <p className="text-xs text-ink/60">밴쿠버</p>
              <div className="text-2xl font-semibold">{vancouver.time}</div>
              <p className="text-xs text-ink/60">{vancouver.date}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-rose/20 px-4 py-3 text-sm font-medium text-ink">
            {greeting}
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft">
          <div className="rain">
            {Array.from({ length: 28 }).map((_, index) => (
              <span
                key={index}
                className="raindrop"
                style={{
                  left: `${(index * 13) % 100}%`,
                  top: `${(index * 7) % 40}%`,
                  animationDelay: `${index * 0.15}s`,
                }}
              />
            ))}
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-ink/60">
              <CloudRain size={18} />
              Raincouver Mode
            </div>
            <h3 className="mt-2 text-xl font-semibold">밴쿠버 현재 날씨</h3>
            <p className="mt-1 text-sm text-ink/70">지금은 비가 오는 중 ☔️</p>
            <div className="mt-4 rounded-2xl bg-serenity/20 px-4 py-3 text-sm font-medium">
              우산 챙겼어? ☔️
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <Heart className="heart-pulse" size={18} />
            Love D-Day
          </div>
          <h3 className="mt-2 text-xl font-semibold">
            재회까지 {countdown.isPast ? "이미 만난 날" : "남은 시간"}
          </h3>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {digits.map((digit, index) => (
              <motion.div
                key={digit.label}
                className="rounded-2xl bg-rose/20 py-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <div className="text-xl font-semibold">
                  {digit.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-ink/60">{digit.label}</div>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/50">
            재회 예정일: 2026년 12월 25일
          </p>
        </section>
      </FadeIn>

      <FadeIn>
        <ScratchCard />
      </FadeIn>

      <FadeIn>
        <section>
          <h3 className="text-lg font-semibold">환율 계산기</h3>
          <p className="mt-1 text-sm text-ink/60">서로의 생활비를 가볍게 체크해봐.</p>
          <div className="mt-4">
            <ExchangeCalculator />
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <MapPin size={18} />
            Future Map
          </div>
          <h3 className="mt-2 text-xl font-semibold">우리가 함께 갈 곳</h3>
          <div className="map-grid relative mt-4 h-40 overflow-hidden rounded-2xl border border-white/60 bg-white/60">
            <div className="absolute left-8 top-10 rounded-full bg-rose/40 px-3 py-1 text-xs">
              로맨틱 카페
            </div>
            <div className="absolute right-10 top-20 rounded-full bg-serenity/40 px-3 py-1 text-xs">
              스탠리 파크
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="text-rose" />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <h3 className="text-xl font-semibold">Secret Letter</h3>
          <p className="mt-1 text-sm text-ink/60">오늘 하루 어땠어?</p>
          <textarea
            placeholder="너의 하루를 적어줘..."
            className="mt-4 h-28 w-full rounded-2xl border border-white/70 bg-white/70 p-3 text-sm"
          />
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose/30 py-3 text-sm font-semibold">
            <Send size={16} />
            전송
          </button>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="grid gap-4">
          <MoodButtons />
          <div className="glass rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm text-ink/60">
              <Music2 size={18} />
              우리의 플레이리스트
            </div>
            <h3 className="mt-2 text-xl font-semibold">오늘의 함께 듣기</h3>
            <p className="mt-2 text-sm text-ink/70">
              네가 좋아할 것 같은 노래를 골라놨어.
            </p>
            <button className="mt-4 w-full rounded-2xl bg-serenity/30 py-3 text-sm font-semibold">
              듣기 시작 🎧
            </button>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <Sparkles size={18} />
            Daily Wish
          </div>
          <h3 className="mt-2 text-xl font-semibold">오늘의 랜덤 편지</h3>
          <p className="mt-2 text-sm text-ink/70">
            너에게 전하고 싶은 말이 매일 새롭게 떠올라.
          </p>
          <button className="mt-4 w-full rounded-2xl bg-rose/30 py-3 text-sm font-semibold">
            새로운 문장 받기
          </button>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="glass rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <Heart size={18} />
            우리의 약속
          </div>
          <h3 className="mt-2 text-xl font-semibold">함께 하는 루틴</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span>오늘 사진 한 장 보내기</span>
              <span className="text-rose">완료</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span>내일 통화 약속 잡기</span>
              <span className="text-serenity">대기</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span>서로에게 칭찬 한 마디</span>
              <span className="text-rose">진행중</span>
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
