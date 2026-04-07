import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, CheckCircle2, Users, Trophy, GraduationCap, ChevronRight, Bell, X, Cpu, MessageCircle } from "lucide-react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  writeBatch
} from "firebase/firestore";

// --- Types ---
interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  timestamp: number;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// --- Constants ---
const ACADEMY_WHATSAPP = "+93704795370";
const ACADEMY_WEBSITE = "https://sites.google.com/view/ssoacl/home";

const COURSE_ADS = [
  { title: "ترجمه و تفسیر قرآن کریم", desc: "ثبت‌نام دوره‌های جدید با اساتید مجرب آغاز شد." },
  { title: "آموزش زبان عربی", desc: "یادگیری مکالمه و قواعد زبان عربی از مقدماتی تا پیشرفته." },
  { title: "آموزش زبان انگلیسی", desc: "دوره‌های فشرده مکالمه انگلیسی برای تمام سنین." },
  { title: "آموزش کامپیوتر", desc: "آموزش مهارت‌های هفت‌گانه ICDL، گرافیک و برنامه‌نویسی." },
  { title: "تجوید و روخوانی", desc: "آموزش تخصصی قرائت و تجوید قرآن کریم." },
];

// --- Components ---

const AdNotification = () => {
  const [currentAd, setCurrentAd] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showInterval = setInterval(() => {
      setIsVisible(true);
      // Hide after 8 seconds
      setTimeout(() => setIsVisible(false), 8000);
      // Cycle to next ad
      setCurrentAd((prev) => (prev + 1) % COURSE_ADS.length);
    }, 30000); // Every 30 seconds

    // Show first ad after 5 seconds
    const firstTimeout = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 8000);
    }, 5000);

    return () => {
      clearInterval(showInterval);
      clearTimeout(firstTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[100] w-full max-w-[320px] glass-card p-5 border-gold/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          dir="rtl"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 left-3 text-white/30 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
              <Bell size={24} className="text-gold" />
            </div>
            <div className="space-y-1">
              <h4 className="text-gold font-bold text-sm">اطلاعیه ثبت‌نام</h4>
              <h3 className="text-white font-bold text-base leading-tight">{COURSE_ADS[currentAd].title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{COURSE_ADS[currentAd].desc}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-display">Shining Stars Academy</span>
            <a
              href={ACADEMY_WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gold font-bold uppercase tracking-widest hover:underline"
            >
              اطلاعات بیشتر و ثبت‌نام
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Footer = () => (
  <footer className="relative z-10 py-24 border-t border-white/5 bg-midnight/90 backdrop-blur-3xl" dir="rtl">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col items-center space-y-20">

        {/* 1. Primary Contact (Academy) */}
        <div className="flex flex-col items-center space-y-8 w-full max-w-2xl">
          <div className="text-center space-y-2">
            <h4 className="text-gold font-display text-xs uppercase tracking-[0.4em] font-black">Official Academy Contact</h4>
            <p className="text-white/40 text-sm">ارتباط مستقیم با واحد ثبت‌نام و مشاوره آکادمی</p>
          </div>

          <a
            href={`https://wa.me/${ACADEMY_WHATSAPP.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full inline-flex items-center justify-center gap-8 px-12 py-6 rounded-3xl bg-green-500/5 border border-green-500/20 text-green-400 hover:text-white transition-all duration-700 overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.05)]"
            dir="ltr"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]">
                <MessageCircle size={28} />
              </div>
              <span className="font-mono text-3xl md:text-4xl tracking-tighter font-black">{ACADEMY_WHATSAPP}</span>
            </div>
          </a>
        </div>

        {/* 2. Developer Branding (WBT) */}
        <div className="flex flex-col items-center space-y-8 pt-12 border-t border-white/5 w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-110 hover:rotate-6 duration-500">
              <Cpu size={32} className="animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-display font-black text-2xl tracking-tight leading-none mb-1">Wahdat Brain Technology</h3>
              <span className="text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-[0.5em] font-black">AI & Innovation Hub</span>
            </div>
          </div>

          <div className="text-center space-y-3" dir="ltr">
            <p className="text-white/60 text-sm font-medium tracking-wide">
              Designed, Developed & Managed by <span className="text-gold font-bold">Wahdat Brain Technology (WBT)</span>
            </p>
            <p className="text-white/20 text-[11px] tracking-[0.3em] uppercase font-display">
              @ 2026 Wahdat Brain Technology (WBT). All Rights Reserved.
            </p>
          </div>
        </div>

        {/* 3. Bottom Legal Bar */}
        <div className="w-full pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-10 text-[10px] text-white/20 uppercase tracking-[0.2em] font-display">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Cookie Policy</a>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-px w-12 bg-white/10"></div>
            <div className="text-[10px] text-white/20 font-display tracking-[0.5em] uppercase">
              Global Standards • Local Expertise
            </div>
          </div>
        </div>

      </div>
    </div>
  </footer>
);

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex justify-between items-center bg-midnight/40 backdrop-blur-xl border-b border-white/5">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-light rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
        <Star className="text-midnight fill-midnight" size={24} />
      </div>
      <div className="flex flex-col">
        <span className="font-serif text-xl font-black tracking-tight leading-none gold-gradient-text">Shining Stars</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-display">Academy</span>
      </div>
    </div>
    <Link to="/admin" className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-gold transition-colors font-display">
      Admin Panel
    </Link>
  </nav>
);

const StarField = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        initial={{
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.5 + 0.2
        }}
        animate={{
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          delay: Math.random() * 5
        }}
      />
    ))}
  </div>
);

const LandingPage = () => {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", fatherName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert("دیتابیس متصل نیست. لطفاً فایل تنظیمات را چک کنید.");
      return;
    }
    setIsSubmitting(true);

    try {
      const path = "registrations";
      await addDoc(collection(db, path), {
        ...formData,
        timestamp: Date.now(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ firstName: "", lastName: "" , fatherName: "" });
    } catch (error) {
      setIsSubmitting(false);
      handleFirestoreError(error, OperationType.CREATE, "registrations");
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto overflow-hidden">
      <StarField />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold-light text-xs font-display font-semibold mb-10 tracking-widest uppercase"
        >
          <Trophy size={14} className="text-gold" />
          <span>The Grand Academy Challenge</span>
        </motion.div>

        <h1 className="font-serif text-5xl md:text-8xl font-black leading-[1] mb-8 tracking-tighter">
          به چالش بزرگ و شگفت انگیز <br />
          <span className="gold-gradient-text glow-gold italic">آکادمی ستاره‌های درخشان</span> <br />
          خوش آمدید!
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light mb-10">
          فرصتی استثنایی برای یادگیری و درخشش با
          <span className="text-gold font-bold"> ۵۰ سیت پکیج های درسی معتبر با سرتیفیکت از کمپنی خارجی </span>.
          با ثبت‌نام در این چالش، نام و تخلص شما در
          <span className="text-white font-medium"> نظرسنجی </span>
          کانال واتس‌آپ قرار می‌گیرد. هر کسی که بیشترین
          <span className="text-white font-medium"> رای </span>
          را کسب کند، برنده پکیج آموزشی رایگان و سرتیفیکیت معتبر بین‌المللی خواهد شد.
        </p>

        <motion.a
          href="https://whatsapp.com/channel/your-channel-link" // Replace with actual link
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-600/20 border border-green-500/30 text-green-400 font-bold hover:bg-green-600/30 transition-all group"
        >
          <Users size={20} />
          <span>عضویت در کانال واتس‌آپ آکادمی</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </motion.div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-7 glass-card p-10 md:p-14 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] -mr-48 -mt-48 rounded-full group-hover:bg-gold/10 transition-colors duration-700" />

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-8 relative z-10"
                dir="rtl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-display font-bold text-gold/60 uppercase tracking-widest pr-2">نام</label>
                    <input
                      required
                      type="text"
                      placeholder="نام خود را وارد کنید"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-lg"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-display font-bold text-gold/60 uppercase tracking-widest pr-2">تخلص</label>
                    <input
                      required
                      type="text"
                      placeholder="تخلص خود را وارد کنید"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-lg"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-display font-bold text-gold/60 uppercase tracking-widest pr-2">نام پدر (ولد)</label>
                  <input
                    required
                    type="text"
                    placeholder="نام پدر خود را وارد کنید"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-lg"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full gold-button flex items-center justify-center gap-4 group"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-midnight/20 border-t-midnight rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg">ثبت‌نام و شرکت در نظرسنجی</span>
                      <Send size={20} className="group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-8"
                dir="rtl"
              >
                <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                  <CheckCircle2 className="text-gold" size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif font-black gold-gradient-text">ثبت‌نام با موفقیت انجام شد</h2>
                  <p className="text-white/50 max-w-sm mx-auto leading-relaxed">
                    نام و تخلص شما به لیست نظرسنجی در کانال واتس‌آپ اضافه خواهد شد. برای برنده شدن، رای جمع کنید!
                  </p>
                  <a
                    href="https://whatsapp.com/channel/your-channel-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all"
                  >
                    مشاهده نظرسنجی در واتس‌آپ
                  </a>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-display font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-widest"
                >
                  ثبت‌نام برای شخص دیگر
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-5 space-y-6"
          dir="rtl"
        >
          {[
            { icon: Users, title: "بیشترین رای (Vote)", desc: "کسب بالاترین رای در نظرسنجی رسمی کانال واتس‌آپ آکادمی" },
            { icon: GraduationCap, title: "پکیج‌های درسی معتبر", desc: "۵۰ سیت پکیج آموزشی رایگان با سرتیفیکت از کمپنی خارجی برای برندگان" },
            { icon: Star, title: "سرتیفیکیت بین‌المللی", desc: "صدور گواهینامه رسمی و معتبر جهانی برای برندگان" },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card p-8 flex items-start gap-6 group hover:bg-white/[0.06] transition-colors duration-500"
            >
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                <item.icon size={28} className="text-gold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-gold-light transition-colors">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && db) {
      const path = "registrations";
      const q = query(collection(db, path), orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Registration[];
        setRegistrations(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // رمز عبور پیش‌فرض: admin123 (می‌توانید در کد تغییر دهید)
    if (password === "w123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("رمز عبور اشتباه است!");
    }
  };

  const clearData = async () => {
    if (!db) return;
    if (window.confirm("آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟")) {
      try {
        const path = "registrations";
        const snapshot = await getDocs(collection(db, path));
        const batch = writeBatch(db);

        snapshot.docs.forEach((document) => {
          batch.delete(doc(db, path, document.id));
        });

        await batch.commit();
        setRegistrations([]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, "registrations");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <StarField />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 w-full max-w-md text-center relative z-10"
          dir="rtl"
        >
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="text-gold" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-black mb-2 gold-gradient-text">ورود به مدیریت</h2>
          <p className="text-white/40 text-sm mb-8 font-display uppercase tracking-widest">Admin Authentication</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-display font-bold text-gold/60 uppercase tracking-widest pr-2">رمز عبور</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-center tracking-[0.5em]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full gold-button py-4 shadow-none"
            >
              تأیید و ورود
            </button>
          </form>
          <Link to="/" className="block mt-8 text-xs font-display font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors">
            Back to Website
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto relative">
      <StarField />
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16 relative z-10" dir="rtl">
        <div className="text-center md:text-right">
          <h1 className="font-serif text-5xl font-black mb-3 gold-gradient-text glow-gold">لیست شرکت‌کنندگان</h1>
          <p className="text-white/40 font-display tracking-widest uppercase text-sm">Total Registrations: <span className="text-gold font-bold">{registrations.length}</span></p>
        </div>
        <button
          onClick={clearData}
          className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-display font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
        >
          Clear All Data
        </button>
      </div>

      <div className="glass-card overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10">
                <th className="px-8 py-6 font-display font-bold text-gold/60 uppercase tracking-widest text-xs">نام</th>
                <th className="px-8 py-6 font-display font-bold text-gold/60 uppercase tracking-widest text-xs">تخلص</th>
                <th className="px-8 py-6 font-display font-bold text-gold/60 uppercase tracking-widest text-xs">نام پدر (ولد)</th>
                <th className="px-8 py-6 font-display font-bold text-gold/60 uppercase tracking-widest text-xs">زمان ثبت‌نام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 font-bold text-white group-hover:text-gold-light transition-colors">{reg.firstName}</td>
                  <td className="px-8 py-6 text-white/70">{reg.lastName}</td>
                  <td className="px-8 py-6 text-white/70">{reg.fatherName}</td>
                  <td className="px-8 py-6 text-white/30 text-xs font-display">
                    {new Date(reg.timestamp).toLocaleString("fa-IR")}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center text-white/20 italic font-serif text-xl">
                    هنوز هیچ ستاره‌ای ثبت‌نام نکرده است...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-display font-bold text-white/30 hover:text-gold transition-all uppercase tracking-[0.2em] group">
          <ChevronRight size={16} className="rotate-180 group-hover:translate-x-[-4px] transition-transform" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="font-sans">
        <Navbar />
        <AdNotification />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
