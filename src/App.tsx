import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, Heart, User, Shield, AlertTriangle, Trash2, 
  Plus, Edit, Check, X, RefreshCw, LogIn, ChevronRight, Sparkles, 
  Coins, Bell, FileText, Upload, ChevronLeft, Lock, Languages 
} from "lucide-react";
import { 
  subscribeToDB, getMangas, getChapters, getCurrentUser, saveCurrentUser, 
  getFavorites, toggleFavorite, addManga, updateManga, deleteManga, 
  addChapter, getAllUsers, saveAllUsers, clearTransientCache, 
  submitTranslatorRequest, getTranslatorRequests, updateTranslatorRequest, 
  getNotifications, markNotificationsAsRead, addToUserHistory 
} from "./db";
import { Manga, Chapter, UserProfile, AppNotification } from "./types";

export default function App() {
  // DB States
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"Asosiy" | "Qidiruv" | "Saqlanganlar" | "Profil" | "Admin">("Asosiy");
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  // Authentication State
  const [googleAuthOpen, setGoogleAuthOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGenre, setFilteredGenre] = useState("Barchasi");
  const [filteredType, setFilteredType] = useState("Barchasi");
  const [filteredBilling, setFilteredBilling] = useState("Barchasi");
  const [filteredStatus, setFilteredStatus] = useState("Barchasi");

  // Carousel
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Admin Lock States
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminLockTimeLeft, setAdminLockTimeLeft] = useState(14400); // 4 hours in seconds
  const [adminIncorrect, setAdminIncorrect] = useState(false);

  // Plus Action Menu
  const [plusOpen, setPlusOpen] = useState(false);
  const [plusTab, setPlusTab] = useState<"manga" | "chapter">("manga");

  // Profile Action Modals
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileIdCheckOpen, setProfileIdCheckOpen] = useState(false);
  const [clearCacheMsg, setClearCacheMsg] = useState("");
  const [rechargeAmt, setRechargeAmt] = useState("");
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Plus form variables
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newStudio, setNewStudio] = useState("");
  const [newYear, setNewYear] = useState(2026);
  const [newType, setNewType] = useState<"Manga" | "Manhwa" | "Manhua" | "Novella">("Manga");
  const [newStatus, setNewStatus] = useState<"Tugallangan" | "Davom etmoqda">("Davom etmoqda");
  const [newBilling, setNewBilling] = useState<"Obuna" | "Bepul">("Bepul");
  const [newVolumes, setNewVolumes] = useState(0);
  const [newSeasons, setNewSeasons] = useState(0);
  const [newGenresList, setNewGenresList] = useState<string[]>([]);
  const [newCover, setNewCover] = useState("");

  // Chapter form variables
  const [targetMangaId, setTargetMangaId] = useState("");
  const [chSeason, setChSeason] = useState(0);
  const [chVolume, setChVolume] = useState(0);
  const [chNum, setChNum] = useState("");
  const [chTitle, setChTitle] = useState("");
  const [pdfUploadPercent, setPdfUploadPercent] = useState<number | null>(null);
  const [customPagesCount, setCustomPagesCount] = useState(5);

  // ID search variables (Sirli ID ma'lumotlari)
  const [idInputVal, setIdInputVal] = useState("");
  const [idResultText, setIdResultText] = useState<{ count: number; list: string[] } | null>(null);
  const [megaAdminStep, setMegaAdminStep] = useState(1); // 1: Enter ID, 2: Enter Email, 3: Enter OTP
  const [megaEmailInput, setMegaEmailInput] = useState("");
  const [megaOtpInput, setMegaOtpInput] = useState("");
  const [megaError, setMegaError] = useState("");

  // Translator Form variables
  const [transExp, setTransExp] = useState("");
  const [transBio, setTransBio] = useState("");

  // Toast status
  const [toastMessage, setToastMessage] = useState("");

  const genres = [
    "Harakat", "Ramantika", "Fantaziya", "Komedia", "Horror", "Drama", 
    "Ilmiy-Fantastika", "Sarguzasht", "Sirli", "Hayotdan parcha", 
    "Sport", "Psixologik", "G'ayratabiiy", "O'zga dunyo"
  ];

  // Load and subscribe
  useEffect(() => {
    const updateStates = () => {
      setMangas(getMangas());
      setChapters(getChapters());
      setUser(getCurrentUser());
      setFavorites(getFavorites());
      setNotifications(getNotifications());
      setAllUsers(getAllUsers());
    };
    updateStates();
    return subscribeToDB(updateStates);
  }, []);

  // Google Login check on start
  useEffect(() => {
    if (user && user.email === "guest@animanxwa.uz") {
      setGoogleAuthOpen(true);
    }
  }, [user]);

  // Admin Countdown & Session Lock Auto Action
  useEffect(() => {
    let interval: any = null;
    if (adminUnlocked) {
      interval = setInterval(() => {
        setAdminLockTimeLeft((prev) => {
          if (prev <= 1) {
            setAdminUnlocked(false);
            setToast("Admin paneli 4 soat davomida kirilmagani sababli faoliyatsiz deb topildi va yopildi.");
            return 14400;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adminUnlocked]);

  // Carousel animation
  useEffect(() => {
    if (mangas.length > 0) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % Math.min(mangas.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mangas]);

  const setToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Google Sign-In Selectors
  const handleGoogleSelect = (chosen: "Shadow" | "Anvar" | "Guest" | "New") => {
    if (chosen === "Shadow") {
      const shadowProfile: UserProfile = {
        id: "SsSsS20080216",
        name: "Shadow Soya",
        email: "ShadowSoya8@gmail.com",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow",
        role: "Admin",
        balance: 150000,
        hasSubscription: true,
        history: ["solo-leveling", "the-horizon"],
        isEgaAdmin: true
      };
      saveCurrentUser(shadowProfile);
      setToast("Google orqali kirdingiz: Shadow Soya (Admin)");
    } else if (chosen === "Anvar") {
      const anvarProfile: UserProfile = {
        id: "44326787907765423552790",
        name: "Anvarbek O'zbek",
        email: "anvar99@gmail.com",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anvar",
        role: "Foydalanuvchi",
        balance: 45000,
        hasSubscription: false,
        history: ["demon-slayer"]
      };
      saveCurrentUser(anvarProfile);
      setToast("Google orqali kirdingiz: Anvarbek");
    } else {
      let randomID = "";
      for (let i = 0; i < 23; i++) {
        randomID += Math.floor(Math.random() * 10).toString();
      }
      const newProf: UserProfile = {
        id: randomID,
        name: `Yangi O'quvchi_${randomID.slice(0, 4)}`,
        email: `animanxwa_${randomID.slice(0, 5)}@gmail.com`,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomID}`,
        role: "Foydalanuvchi",
        balance: 20000,
        hasSubscription: false,
        history: []
      };
      saveCurrentUser(newProf);
      setToast("Google orqali kirdingiz: Yangi foydalanuvchi");
    }
    setGoogleAuthOpen(false);
  };

  // Admin Unlock Passwords Handler
  const handleAdminVerify = () => {
    if (pass1 === "AniManxwa.2026.uz" && pass2 === "AniManxwa.Shadow.2026.SsSsS") {
      setAdminUnlocked(true);
      setAdminLockTimeLeft(14400); // Reset timer to 4 hours
      setAdminIncorrect(false);
      setToast("Admin paneliga muvaffaqiyatli kirdingiz!");
    } else {
      setAdminIncorrect(true);
      setToast("Parollardan biri noto'g'ri kitildi!");
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Manga creation submission
  const handleAddMangaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addManga({
      title: newTitle,
      description: newDesc,
      author: newAuthor,
      studio: newStudio,
      year: newYear,
      type: newType,
      status: newStatus,
      billing: newBilling,
      volumes: newVolumes,
      seasons: newSeasons,
      genres: newGenresList,
      coverUrl: newCover,
    });
    setToast("Yangi manga muvaffaqiyatli qo'shildi!");
    // reset form
    setNewTitle(""); setNewDesc(""); setNewAuthor(""); setNewStudio("");
    setNewCover(""); setNewGenresList([]);
    setPlusOpen(false);
  };

  // Chapter creation submission
  const handleAddChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMangaId || !chNum) {
      setToast("Manga va bob raqamini belgilang!");
      return;
    }
    setPdfUploadPercent(10);
    const interval = setInterval(() => {
      setPdfUploadPercent((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          addChapter({
            mangaId: targetMangaId,
            chapterNumber: chNum,
            title: chTitle,
            season: chSeason || undefined,
            volume: chVolume || undefined,
            pagesFiles: null,
            customPdfPagesCount: customPagesCount
          });
          setToast(`${chNum}-bob barcha sahifalari bilan muvaffaqiyatli yaratildi!`);
          setChNum(""); setChTitle("");
          setPlusOpen(false);
          return null;
        }
        return prev + 30;
      });
    }, 500);
  };

  // Clear cache action
  const handleClearCache = () => {
    const msg = clearTransientCache();
    setClearCacheMsg(msg);
    setTimeout(() => setClearCacheMsg(""), 4000);
  };

  // Recharge Balance Action
  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseInt(rechargeAmt.replace(/[^0-9]/g, ""));
    if (user && cleanAmt > 0) {
      const updatedUser = { ...user, balance: user.balance + cleanAmt };
      saveCurrentUser(updatedUser);
      setToast(`${cleanAmt.toLocaleString("uz-UZ")} UZS balansingizga qo'shildi!`);
      setRechargeAmt("");
      setRechargeOpen(false);
    }
  };

  // Subscribe Action
  const buyPremiumSubscription = () => {
    if (user) {
      if (user.balance >= 25000) {
        const updated = { ...user, balance: user.balance - 25000, hasSubscription: true };
        saveCurrentUser(updated);
        setToast("Premium Obuna 1 oyga faollashtirildi! Barcha pullik boblar ochiq.");
        setSubOpen(false);
      } else {
        setToast("Balansingizda yetarli mablag' mavjud emas. Avval hisobni to'ldiring!");
      }
    }
  };

  // Submit Translator Request Action
  const handleTranslatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      submitTranslatorRequest({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        experience: transExp,
        about: transBio
      });
      setToast("Arizangiz qabul qilindi va ko'rib chiqilmoqda!");
      setTransExp(""); setTransBio("");
      setTranslatorOpen(false);
    }
  };

  // ID Information Check (Secret Input 5.9)
  const handleLookUpID = () => {
    setMegaError("");
    const matchedUser = allUsers.find(u => u.id === idInputVal);

    if (idInputVal === "SsSsS20080216") {
      // Secret Admin ID trigger
      setMegaAdminStep(2); // Ask for Email next
      return;
    }

    if (matchedUser) {
      // Regular user details
      const readMangasTitles = matchedUser.history.map(mId => mangas.find(m => m.id === mId)?.title || mId);
      setIdResultText({
        count: matchedUser.history.length,
        list: readMangasTitles
      });
    } else {
      setMegaError("ID raqamingizni to'g'ri kiriting!");
    }
  };

  // Verify Admin Email and send mock OTP
  const handleAdminEmailSubmit = () => {
    if (megaEmailInput.toLowerCase() === "shadowsoya8@gmail.com") {
      setMegaAdminStep(3); // Enter verification code step
      setToast("KOD: 2026 pochtangizga yuborildi!");
    } else {
      setMegaError("Kirish mumkun emas siz admin emassiz!");
    }
  };

  // OTP Validation to become Ega permanently
  const handleAdminOtpSubmit = () => {
    if (megaOtpInput === "2026" && user) {
      const updatedUser: UserProfile = { ...user, role: "Admin", isEgaAdmin: true, email: "ShadowSoya8@gmail.com", name: "Shadow Soya" };
      saveCurrentUser(updatedUser);
      setToast("Xush kelibsiz Ega! Tizim sizni bir umr eslab qoladi.");
      setProfileIdCheckOpen(false);
      // reset states
      setIdInputVal(""); setIdResultText(null); setMegaAdminStep(1); setMegaEmailInput(""); setMegaOtpInput("");
    } else {
      setMegaError("Tasdiqlash kodi noto'g'ri!");
    }
  };

  // Set Profile Name and Avatar Editor
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      saveCurrentUser(user);
      setToast("Profil muvaffaqiyatli tahrirlandi!");
      setProfileEditOpen(false);
    }
  };

  const startReadManga = (manga: Manga) => {
    addToUserHistory(manga.id);
    setSelectedManga(manga);
    // Find first chapter
    const mChapters = chapters.filter(c => c.mangaId === manga.id).sort((a,b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber));
    if (mChapters.length > 0) {
      setActiveChapter(mChapters[0]);
    } else {
      setActiveChapter(null);
    }
  };

  // Filtering Logic
  const getFilteredMangas = () => {
    return mangas.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filteredGenre === "Barchasi" || m.genres.includes(filteredGenre);
      const matchesType = filteredType === "Barchasi" || m.type === filteredType;
      const matchesBilling = filteredBilling === "Barchasi" || m.billing === filteredBilling;
      const matchesStatus = filteredStatus === "Barchasi" || m.status === filteredStatus;
      return matchesSearch && matchesGenre && matchesType && matchesBilling && matchesStatus;
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-red-800 selection:text-white">
      
      {/* Dynamic Toast Alerts */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-900 border-l-4 border-red-500 text-stone-100 py-3 px-6 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-red-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ----------------- GOOGLE AUTHENTICATION SCREEN ----------------- */}
      {googleAuthOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-red-900/20 to-transparent blur-3xl pointer-events-none" />
          
          <div className="max-w-md w-full bg-stone-900 p-8 rounded-2xl border border-red-900/50 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-800/10 rounded-full blur-2xl" />
            
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-red-600/10 rounded-xl border border-red-500/30">
                <BookOpen className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                AniManxwa
              </h1>
              <p className="text-sm text-stone-400">
                Manga, Manhwa va Novellalar dunyosiga xush kelibsiz
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl text-xs text-left text-stone-400 border border-stone-800">
              <p className="font-bold text-red-500 mb-1">💡 Sinovdan o'tkazish uchun yordam:</p>
              Tizimni to'liq qudrati (Ega admin bo'limi, manga va bob qo'shish) uchun <strong className="text-stone-200">Shadow Soya (Admin)</strong> profiliga bosing.
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-300 mb-2">Tizimga kirish turini tanlang:</p>
              
              <button 
                onClick={() => handleGoogleSelect("Shadow")}
                className="w-full flex items-center justify-between p-4 bg-stone-950 hover:bg-stone-800 border border-red-500/30 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center text-xs font-bold">S</div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-stone-200 group-hover:text-red-500">Shadow Soya (Admin)</p>
                    <p className="text-xs text-stone-500">ShadowSoya8@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => handleGoogleSelect("Anvar")}
                className="w-full flex items-center justify-between p-4 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400">A</div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-stone-300">Anvarbek O'zbek</p>
                    <p className="text-xs text-stone-600">anvar99@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => handleGoogleSelect("New")}
                className="w-full flex items-center justify-between p-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all text-center justify-center cursor-pointer gap-2"
              >
                <LogIn className="w-5 h-5" />
                Google orqali tezda kirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TOP NAVBAR BRAND ----------------- */}
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-xl font-black tracking-widest text-red-600 flex items-center gap-1.5 cursor-pointer" onClick={() => { setSelectedManga(null); setActiveChapter(null); }}>
              AniManxwa
            </h1>
            <p className="text-[10px] text-stone-500 font-semibold tracking-wider">UZBEK TILIDA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button 
            onClick={() => { setNotificationsOpen(true); markNotificationsAsRead(); }}
            className="p-2 bg-stone-900 rounded-xl hover:bg-stone-850 relative group transition-all"
          >
            <Bell className="w-5 h-5 text-stone-300 group-hover:text-red-500 transition-colors" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-stone-900 animate-ping" />
            )}
          </button>

          {/* User Profile Mini Bar */}
          {user && (
            <div 
              onClick={() => setActiveTab("Profil")}
              className="flex items-center gap-2.5 bg-stone-900 pl-3 pr-2.5 py-1.5 rounded-xl border border-stone-850 hover:border-red-900/40 cursor-pointer transition-all active:scale-95"
            >
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-stone-200">{user.name}</p>
                <p className="text-[9px] text-red-500 font-bold tracking-widest uppercase">{user.role}</p>
              </div>
              <img 
                src={user.avatarUrl} 
                alt="Profile" 
                className="w-7 h-7 rounded-lg border border-stone-750 bg-stone-800"
              />
            </div>
          )}
        </div>
      </header>

      {/* ----------------- SECTIONS / MAIN SCREEN AREA ----------------- */}
      <main className="flex-1 px-4 py-5 max-w-6xl w-full mx-auto pb-24 overflow-y-auto">
        
        {/* If Active Chapter Reader is Opened */}
        {activeChapter ? (
          <div className="space-y-6">
            {/* Navigation Header */}
            <div className="bg-stone-900 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-stone-850">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChapter(null)}
                  className="p-2 bg-stone-950 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer text-stone-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-sm text-stone-400 font-bold">{selectedManga?.title}</h3>
                  <h2 className="text-base font-extrabold text-red-500">{activeChapter.chapterNumber}-BOB: {activeChapter.title}</h2>
                </div>
              </div>

              {/* Page Lock Instructions Banner */}
              <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-red-900/20 text-xs text-stone-400">
                <Shield className="w-4 h-4 text-red-500 animate-pulse" />
                Mualliflik huquqini himoya qilish tizimi faol!
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const sorted = chapters.filter(c => c.mangaId === selectedManga?.id).sort((a,b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber));
                    const idx = sorted.findIndex(c => c.id === activeChapter.id);
                    if (idx > 0) setActiveChapter(sorted[idx - 1]);
                  }}
                  className="px-3 py-1.5 bg-stone-950 hover:bg-stone-850 disabled:opacity-30 text-xs text-stone-300 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                  disabled={chapters.filter(c => c.mangaId === selectedManga?.id).indexOf(activeChapter) === 0}
                >
                  Oldingi
                </button>
                <button 
                  onClick={() => {
                    const sorted = chapters.filter(c => c.mangaId === selectedManga?.id).sort((a,b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber));
                    const idx = sorted.findIndex(c => c.id === activeChapter.id);
                    if (idx !== -1 && idx < sorted.length - 1) setActiveChapter(sorted[idx + 1]);
                  }}
                  className="px-3 py-1.5 bg-stone-950 hover:bg-stone-850 disabled:opacity-30 text-xs text-stone-300 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                  disabled={chapters.filter(c => c.mangaId === selectedManga?.id).indexOf(activeChapter) === chapters.filter(c => c.mangaId === selectedManga?.id).length - 1}
                >
                  Keyingi
                </button>
              </div>
            </div>

            {/* SECURE COMIC READER VIEW (Prevents Long Press, Save, Right-Click) */}
            <div 
              className="max-w-2xl mx-auto bg-stone-900 p-2 rounded-2xl border border-stone-800 shadow-2xl relative overflow-hidden select-none"
              onContextMenu={(e) => {
                e.preventDefault();
                setToast("Diqqat! Sahifalarni yuklab olishga ruxsat berilmaydi.");
              }}
            >
              {/* Invisible Shield Layer Overlay to block element targeting */}
              <div className="absolute inset-0 z-30 pointer-events-auto bg-transparent select-none active:pointer-events-none" />

              <div className="space-y-1 relative">
                {activeChapter.pages.length > 0 ? (
                  activeChapter.pages.map((p, idx) => (
                    <img 
                      key={idx} 
                      src={p} 
                      alt={`Manga page ${idx + 1}`}
                      className="w-full h-auto select-none drag-none pointer-events-none filter brightness-95 rounded"
                      onError={(e) => {
                        // fallback stylized indicator
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center text-stone-500">
                    Kechirasiz, ushbu bob uchun hech qanday rasm yuklanmagan.
                  </div>
                )}
              </div>

              {/* Reader bottom panel */}
              <div className="bg-stone-950 mt-4 p-5 rounded-xl border border-stone-850 text-center space-y-4">
                <p className="text-sm font-bold text-stone-400">🔥 Ushbu bob o'qib tugatildi! 🔥</p>
                <button 
                  onClick={() => { setActiveChapter(null); }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  Asosiy sahifaga qaytish
                </button>
              </div>
            </div>
          </div>
        ) : selectedManga ? (
          
          /* ----------------- SPECIFIC MANGA DETAIL VIEW ----------------- */
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header / Hero Section */}
            <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6">
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs z-10" />
              
              {/* Aspect Ratio 7:10 Cover image card */}
              <div 
                className="w-full max-w-[200px] aspect-[7/10] shrink-0 rounded-xl border-2 border-red-600 z-20 flex flex-col items-center justify-center p-3 font-semibold text-center text-xs relative overflow-hidden shadow-2xl"
                style={{ background: selectedManga.coverUrl.startsWith("rgba") ? selectedManga.coverUrl : `url(${selectedManga.coverUrl}) center/cover` }}
              >
                {!selectedManga.coverUrl.startsWith("rgba") && selectedManga.coverUrl && <img src={selectedManga.coverUrl} className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/40" />
                <span className="z-10 text-stone-200 mt-auto font-black leading-tight drop-shadow-md">{selectedManga.title}</span>
                
                {/* Billing overlay flag */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-full ${selectedManga.billing === "Obuna" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                    {selectedManga.billing}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex-1 space-y-4 z-20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 bg-red-900/60 border border-red-500/30 text-red-400 rounded-full font-bold text-xs">
                      {selectedManga.type}
                    </span>
                    <h2 className="text-2xl font-black text-stone-100 uppercase tracking-wide mt-2">{selectedManga.title}</h2>
                    <p className="text-xs text-stone-400 font-medium">Muallif: <strong className="text-stone-200">{selectedManga.author}</strong> • Studiya: <strong className="text-stone-200">{selectedManga.studio}</strong></p>
                  </div>

                  {/* Bookmark Save Action (Heart Button) */}
                  <button 
                    onClick={() => {
                      const isNowFav = toggleFavorite(selectedManga.id);
                      setToast(isNowFav ? "Sevimlilarga qo'shildi!" : "Sevimlilardan olib tashlandi.");
                    }}
                    className={`p-3 rounded-full hover:bg-stone-800 transition-all font-bold ${favorites.includes(selectedManga.id) ? "bg-red-600 border-none text-white animate-pulse" : "bg-stone-950 border border-stone-800 text-stone-400"}`}
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </button>
                </div>

                <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-height-40 overflow-y-auto pr-2 bg-stone-950/40 p-3 rounded-lg">
                  {selectedManga.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-950 p-3.5 rounded-xl border border-stone-850">
                  <div>
                    <span className="text-stone-500">Holat:</span>
                    <p className={`font-bold ${selectedManga.status === "Tugallangan" ? "text-emerald-500" : "text-amber-500"}`}>{selectedManga.status}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Yil:</span>
                    <p className="font-bold text-stone-200">{selectedManga.year}-yil</p>
                  </div>
                  <div>
                    <span className="text-stone-500">To'lov:</span>
                    <p className={`font-bold ${selectedManga.billing === "Obuna" ? "text-red-500" : "text-emerald-500"}`}>{selectedManga.billing === "Obuna" ? "Obuna (Qizil)" : "Bepul (Yashil)"}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">O'qildi:</span>
                    <p className="font-bold text-red-500">{selectedManga.readCount.toLocaleString()} ta</p>
                  </div>
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedManga.genres.map((g) => (
                    <span key={g} className="px-2 py-1 bg-stone-950 text-stone-400 border border-stone-850 text-[10px] rounded hover:border-red-600 hover:text-stone-100 transition-colors cursor-pointer">
                      #{g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapters / Part List Section */}
            <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-850">
                <h3 className="text-base font-black tracking-wider text-stone-200">BOBLAR RO'YXATI</h3>
                <span className="text-xs text-red-500 font-bold tracking-widest uppercase">
                  {chapters.filter(c => c.mangaId === selectedManga.id).length} ta BOB faol
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {chapters.filter(c => c.mangaId === selectedManga.id).length > 0 ? (
                  chapters.filter(c => c.mangaId === selectedManga.id)
                    .sort((a,b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
                    .map((chapter) => {
                      // Check user permission
                      const needsVIP = selectedManga.billing === "Obuna" && (!user?.hasSubscription && !user?.isEgaAdmin);

                      return (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            if (needsVIP) {
                              setToast("Bu pullik bob hisoblanadi! O'qish uchun Obuna sotib oling.");
                              setSubOpen(true);
                              return;
                            }
                            setActiveChapter(chapter);
                          }}
                          className={`flex items-center justify-between p-3.5 bg-stone-950/70 border rounded-xl transition-all text-left cursor-pointer ${
                            needsVIP 
                              ? "border-red-900/30 hover:border-red-700 hover:bg-red-950/10" 
                              : "border-stone-850 hover:border-red-600 hover:bg-stone-850"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-black text-stone-300">
                              {chapter.chapterNumber}-BOB
                            </p>
                            <p className="text-sm text-stone-200 font-bold truncate max-w-xs">
                              {chapter.title || `Sarlavhasiz qism`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {needsVIP ? (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg">
                                Qulflangan
                              </span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-red-500" />
                            )}
                          </div>
                        </button>
                      );
                    })
                ) : (
                  <div className="col-span-full py-12 text-center text-stone-500/80 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="text-xs">Tez kunda! Ushbu asar uchun hali birorta bob yuklanmadi.</p>
                  </div>
                )}
              </div>

              {/* Details close */}
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedManga(null)}
                  className="px-5 py-2 bg-stone-950 hover:bg-stone-850 text-stone-400 font-semibold rounded-lg text-xs"
                >
                  Orqaga qaytish
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* ----------------- SECTIONS SWITCHBOARD ----------------- */
          <div>
            
            {/* 1. ASOSIY (HOME) TAB */}
            {activeTab === "Asosiy" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 16:9 Carousel / Slider Banner at Top (Ongoing / Featured items) */}
                {mangas.length > 0 && (
                  <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border border-stone-850 group">
                    
                    {/* Active Slide Render */}
                    {mangas.map((m, idx) => {
                      if (idx !== carouselIndex) return null;
                      return (
                        <div key={m.id} className="absolute inset-0 transition-all duration-1000">
                          {/* Rich dark overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent z-10" />
                          
                          {/* Banner Background */}
                          <div 
                            className="absolute inset-0 filter saturate-[0.8] brightness-[0.4]"
                            style={{ background: m.coverUrl.startsWith("rgba") ? m.coverUrl : `url(${m.coverUrl}) center/center` }}
                          />

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 inset-x-0 p-5 md:p-8 z-20 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-red-650 text-white font-extrabold text-[9px] tracking-wider uppercase rounded-full">
                                Ongoing yangi bobi
                              </span>
                              <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-full ${m.billing === "Obuna" ? "bg-red-650" : "bg-emerald-600"}`}>
                                {m.billing === "Obuna" ? "Obuna (Qizil)" : "Bepul (Yashil)"}
                              </span>
                            </div>

                            <h3 className="text-xl md:text-3xl font-black text-stone-100 tracking-wider transition-colors drop-shadow">{m.title}</h3>
                            <p className="text-xs text-stone-300 md:w-2/3 line-clamp-2 md:line-clamp-3">
                              {m.description}
                            </p>

                            <button 
                              onClick={() => startReadManga(m)}
                              className="mt-2 px-5 py-2 bg-red-600 text-white text-xs font-black uppercase rounded-lg hover:bg-red-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              Hozir o'qish
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Left / Right Dots controller indicator */}
                    <div className="absolute bottom-4 right-4 z-25 flex items-center gap-1.5 bg-black/40 p-2 rounded-full backdrop-blur-xs">
                      {mangas.slice(0, 5).map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCarouselIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex ? "bg-red-500 w-4" : "bg-stone-500"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Search Toolbar on Homepage */}
                <div className="bg-stone-900/75 p-3 rounded-2xl flex items-center gap-3 border border-stone-850 shadow-md">
                  <Search className="w-5 h-5 text-stone-500 ml-2" />
                  <input 
                    type="text" 
                    placeholder="Sarlavha yoki muallifni qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-stone-200 placeholder-stone-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-xs text-stone-500 hover:text-stone-300 mr-2 font-bold cursor-pointer">
                      Tozalash
                    </button>
                  )}
                </div>

                {/* Grid Titles block */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-stone-400 tracking-widest uppercase">
                      Katalog ({getFilteredMangas().length} ta asar)
                    </h3>
                  </div>

                  {/* 3-COLUMN COVER GRID AS MANDATED: Aspect 7:10 */}
                  {getFilteredMangas().length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 md:gap-5">
                      {getFilteredMangas().map((manga) => (
                        <div 
                          key={manga.id}
                          onClick={() => startReadManga(manga)}
                          className="bg-stone-900 border border-stone-850 hover:border-red-900 rounded-xl overflow-hidden transition-all duration-350 cursor-pointer group hover:scale-[1.03] hover:shadow-2xl flex flex-col justify-between"
                        >
                          {/* Image box maintaining strict 7:10 aspect ration */}
                          <div 
                            className="aspect-[7/10] w-full shrink-0 relative flex flex-col items-center justify-center p-3 font-semibold text-center text-[10px] sm:text-xs overflow-hidden" 
                            style={{ background: manga.coverUrl.startsWith("rgba") ? manga.coverUrl : `url(${manga.coverUrl}) center/cover` }}
                          >
                            {!manga.coverUrl.startsWith("rgba") && manga.coverUrl && (
                              <img src={manga.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors" />

                            {/* Ongoing or type badges overlay */}
                            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
                              <span className={`px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-lg ${manga.billing === "Obuna" ? "bg-red-650 text-white" : "bg-emerald-600 text-white"}`}>
                                {manga.billing}
                              </span>
                            </div>

                            {/* Small format indicators */}
                            <div className="absolute bottom-1.5 right-1.5 z-10">
                              <span className="px-1 py-0.5 bg-black/70 text-stone-300 text-[8px] font-bold uppercase rounded-sm border border-stone-800">
                                {manga.type}
                              </span>
                            </div>
                          </div>

                          {/* Cover labels */}
                          <div className="p-2 bg-stone-900 flex-1 flex flex-col justify-between space-y-1">
                            <h4 className="text-xs font-black text-stone-100 group-hover:text-red-500 transition-colors line-clamp-1 leading-tight uppercase">
                              {manga.title}
                            </h4>
                            <div className="flex items-center justify-between text-[9px] text-stone-500 font-bold uppercase">
                              <span className={`${manga.status === "Tugallangan" ? "text-emerald-500" : "text-amber-500"}`}>
                                {manga.status}
                              </span>
                              <span>
                                {manga.year}-yil
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-stone-600 border-2 border-dashed border-stone-900 rounded-2xl space-y-3">
                      <AlertTriangle className="w-10 h-10 mx-auto text-stone-700 animate-pulse" />
                      <p className="text-xs">Ushbu so'rovga mos keluvchi bitta ham asar topilmadi.</p>
                      <button onClick={() => { setSearchQuery(""); setFilteredGenre("Barchasi"); setFilteredType("Barchasi"); setFilteredBilling("Barchasi"); setFilteredStatus("Barchasi"); }} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                        Filtrlarni bekor qilish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. QIDIRUV (SEARCH & FILTER) TAB */}
            {activeTab === "Qidiruv" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-lg space-y-4">
                  <h3 className="text-base font-black tracking-wider text-stone-200 uppercase">ILG'OR MANGALAR QIDIRUV ENGINI</h3>
                  
                  {/* Search Bar Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-550" />
                    <input 
                      type="text" 
                      placeholder="Manga, muallif yoki studiyani yozing..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-950 pl-11 pr-4 py-3 border border-stone-800 focus:border-red-650 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    {/* Choose Turi */}
                    <div>
                      <label className="block text-stone-500 font-bold mb-1 mr-1">Turi:</label>
                      <select 
                        value={filteredType} 
                        onChange={(e) => setFilteredType(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 focus:border-red-500 focus:outline-none text-stone-300"
                      >
                        <option value="Barchasi">Barchasi</option>
                        <option value="Manga">Manga</option>
                        <option value="Manhwa">Manhwa</option>
                        <option value="Manhua">Manhua</option>
                        <option value="Novella">Novella</option>
                      </select>
                    </div>

                    {/* Choose Billing */}
                    <div>
                      <label className="block text-stone-500 font-bold mb-1 mr-1">To'lov holati:</label>
                      <select 
                        value={filteredBilling} 
                        onChange={(e) => setFilteredBilling(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 focus:border-red-500 focus:outline-none text-stone-300"
                      >
                        <option value="Barchasi">Barchasi</option>
                        <option value="Obuna">Faqat Obuna (Pullik)</option>
                        <option value="Bepul">Faqat Bepul (Yashil)</option>
                      </select>
                    </div>

                    {/* Choose Status */}
                    <div>
                      <label className="block text-stone-500 font-bold mb-1 mr-1">Holati:</label>
                      <select 
                        value={filteredStatus} 
                        onChange={(e) => setFilteredStatus(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 focus:border-red-500 focus:outline-none text-stone-300"
                      >
                        <option value="Barchasi">Barchasi</option>
                        <option value="Tugallangan">Tugallangan</option>
                        <option value="Davom etmoqda">Etmoqda (Ongoing)</option>
                      </select>
                    </div>
                  </div>

                  {/* Horizontal Genre Tag Selection */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-stone-500 text-xs font-bold">Janrlar bo'yicha filter:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setFilteredGenre("Barchasi")}
                        className={`px-3 py-1 text-xs rounded transition-all cursor-pointer font-semibold ${filteredGenre === "Barchasi" ? "bg-red-600 text-white font-extrabold" : "bg-stone-950 border border-stone-800 text-stone-400"}`}
                      >
                        Barchasi
                      </button>
                      {genres.map((g) => (
                        <button 
                          key={g}
                          onClick={() => setFilteredGenre(g)}
                          className={`px-3 py-1 text-xs rounded transition-all cursor-pointer font-semibold ${filteredGenre === g ? "bg-red-650 text-white font-extrabold" : "bg-stone-950 border border-stone-800 text-stone-400"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter Results Display */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black tracking-widest text-stone-500 uppercase">
                    FILTRLANGAN ASARLAR ({getFilteredMangas().length} TA)
                  </h4>

                  {getFilteredMangas().length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 md:gap-5">
                      {getFilteredMangas().map((m) => (
                        <div 
                          key={m.id}
                          onClick={() => startReadManga(m)}
                          className="bg-stone-900 border border-stone-850 hover:border-red-600 rounded-xl overflow-hidden transition-all duration-350 cursor-pointer group flex flex-col justify-between"
                        >
                          <div 
                            className="aspect-[7/10] w-full shrink-0 relative flex items-center justify-center p-3 font-semibold text-center text-[10px] sm:text-xs overflow-hidden" 
                            style={{ background: m.coverUrl.startsWith("rgba") ? m.coverUrl : `url(${m.coverUrl}) center/cover` }}
                          >
                            {!m.coverUrl.startsWith("rgba") && m.coverUrl && (
                              <img src={m.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/25 transition-colors" />
                            <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-lg ${m.billing === "Obuna" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                              {m.billing}
                            </span>
                          </div>
                          <div className="p-2 bg-stone-900 flex-1 flex flex-col justify-between">
                            <h4 className="text-xs font-black text-stone-100 group-hover:text-red-500 transition-colors line-clamp-1 leading-tight uppercase">
                              {m.title}
                            </h4>
                            <p className="text-[9px] text-stone-500 font-bold truncate mt-1">Muallif: {m.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-stone-600">
                      Hech qanday manga filtrga mos kelmadi.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SAQLANGANLAR (FAVORITES) TAB */}
            {activeTab === "Saqlanganlar" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black tracking-widest text-stone-300 uppercase">SAQLAB QO'YILGAN MANGALARIM</h3>
                  <span className="text-xs text-red-500 font-bold">{favorites.length} ta asar bor</span>
                </div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-5">
                    {favorites.map((fId) => {
                      const m = mangas.find(item => item.id === fId);
                      if (!m) return null;
                      return (
                        <div 
                          key={m.id}
                          onClick={() => startReadManga(m)}
                          className="bg-stone-900 border border-stone-850 hover:border-red-600 rounded-xl overflow-hidden transition-all duration-350 cursor-pointer group flex flex-col justify-between"
                        >
                          <div 
                            className="aspect-[7/10] w-full shrink-0 relative flex items-center justify-center p-3 font-semibold text-center text-[10px] sm:text-xs overflow-hidden" 
                            style={{ background: m.coverUrl.startsWith("rgba") ? m.coverUrl : `url(${m.coverUrl}) center/cover` }}
                          >
                            {!m.coverUrl.startsWith("rgba") && m.coverUrl && (
                              <img src={m.coverUrl} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-stone-950/40" />
                            
                            {/* Remove button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(m.id);
                                setToast("Saqlanganlardan olib tashlandi.");
                              }}
                              className="absolute top-1.5 right-1.5 p-1 bg-stone-950/80 rounded-full hover:bg-red-650 hover:text-white transition-all text-stone-400 z-20 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className={`absolute bottom-2 left-2 px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-lg ${m.billing === "Obuna" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                              {m.billing}
                            </span>
                          </div>
                          <div className="p-2 bg-stone-900">
                            <h4 className="text-xs font-black text-stone-100 truncate line-clamp-1 leading-tight uppercase">
                              {m.title}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-24 text-center text-stone-600 border border-stone-900 rounded-2xl space-y-4">
                    <Heart className="w-12 h-12 text-stone-700 mx-auto fill-none animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-stone-400">Hozircha saqlanganlar bo'limi bo'sh.</p>
                      <p className="text-[10px] text-stone-500 mt-1">Darslar yangi marta yuklansa bildirishnoma tarqatiladi.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("Asosiy")}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Katalogga o'tish
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFIL (USER PROFILE DETAILED HUB) TAB */}
            {activeTab === "Profil" && user && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                
                {/* Core Profile Banner style Card */}
                <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Avatar wrapper plus pencil button */}
                  <div className="relative">
                    <img 
                      src={user.avatarUrl} 
                      alt="Profile Avatar" 
                      className="w-20 h-20 rounded-2xl border-2 border-red-500 bg-stone-950 p-1 project-avatar shadow-lg"
                    />
                    <button 
                      onClick={() => setProfileEditOpen(true)}
                      className="absolute -bottom-1 -right-1 p-1 py-1 bg-red-650 hover:bg-red-700 text-white rounded-lg transition-transform hover:scale-110 active:scale-95 shadow cursor-pointer border border-stone-900"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h2 className="text-xl font-extrabold text-stone-100 flex items-center justify-center sm:justify-start gap-2">
                      {user.name}
                      {user.isEgaAdmin && (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 rounded uppercase tracking-widest">
                          Soya Ega
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-stone-400">{user.email}</p>
                    <p className="text-xs text-stone-500 font-mono tracking-tighter">
                      ID RAQAM: <strong className="text-red-500 font-bold">{user.id}</strong>
                    </p>
                  </div>
                  
                  {/* Account Balance display */}
                  <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-850 text-center sm:text-right shrink-0 space-y-1">
                    <span className="text-[10px] text-stone-500 font-black tracking-widest uppercase">HISOBINGIZ BALANSI</span>
                    <p className="text-lg font-black text-emerald-500">
                      {user.balance.toLocaleString("uz-UZ")} UZS
                    </p>
                    <button 
                      onClick={() => setRechargeOpen(true)}
                      className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 rounded duration-150 text-[10px] font-bold text-emerald-400 cursor-pointer"
                    >
                      Hisobni to'ldirish
                    </button>
                  </div>
                </div>

                {/* Main lists items of actions */}
                <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-850">
                  
                  {/* 5.4 ID ma'lumotlari (Sirli Tugma) */}
                  <button 
                    onClick={() => { setProfileIdCheckOpen(true); }}
                    className="w-full flex items-center justify-between p-4 bg-stone-900/60 hover:bg-stone-850 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-extrabold text-stone-200">ID ma'lumotlari</p>
                        <p className="text-xs text-stone-500">Ega admin tasdiqlash yoki o'zga ID o'qilganlar ro'yxati</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* 5.3 Malumot va hotira */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-stone-400" />
                      <div>
                        <p className="text-sm font-extrabold text-stone-200">Ma'lumot va xotira</p>
                        <p className="text-xs text-stone-500">Kesh va yuklangan barcha rasmlarni tozalash</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleClearCache}
                      className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-750 text-stone-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Keshni tozalash
                    </button>
                  </div>
                  {clearCacheMsg && (
                    <div className="p-3 bg-stone-950 text-xs text-stone-400 text-center animate-pulse">
                      {clearCacheMsg}
                    </div>
                  )}

                  {/* 5.7 Premium Obuna Olish Banner */}
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-stone-850 gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-stone-200">VIP Premium Obuna</p>
                          <span className={`px-2 py-0.5 text-[8px] font-bold rounded ${user.hasSubscription || user.isEgaAdmin ? "bg-emerald-600/20 text-emerald-500" : "bg-stone-800 text-stone-400"}`}>
                            {user.hasSubscription || user.isEgaAdmin ? "Faol" : "Faol emas"}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">Oyiga 25,000 UZS. Barcha pullik obunali manhwalarni ochish</p>
                      </div>
                    </div>
                    {!user.hasSubscription && !user.isEgaAdmin ? (
                      <button 
                        onClick={() => setSubOpen(true)}
                        className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
                      >
                        Obuna sotib olish
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-500 font-bold">Faol Obunachi ✨</span>
                    )}
                  </div>

                  {/* 5.8 Tarjimonlikka so'rov yuborish */}
                  <button 
                    onClick={() => {
                      if (user.role === "Admin") {
                        setToast("Siz allaqachon admin (yoki tarjimon) huquqiga egasiz!");
                        return;
                      }
                      setTranslatorOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-stone-900/60 hover:bg-stone-850 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Languages className="w-5 h-5 text-stone-400 group-hover:text-red-500" />
                      <div>
                        <p className="text-sm font-extrabold text-stone-200">Tarjimonlikka so'rov yuborish</p>
                        <p className="text-xs text-stone-500">Ilovamiz jamoasiga qo'shilish va manga tahrirlash</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Logout Button */}
                <div className="text-center">
                  <button 
                    onClick={() => setGoogleAuthOpen(true)}
                    className="px-6 py-2 bg-stone-900 hover:bg-red-900/20 hover:text-red-400 text-stone-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Google parolini almashtirish
                  </button>
                </div>

              </div>
            )}

            {/* 5. ADMIN PANELI TAB (LOCKABLE AND Countdown Session) */}
            {activeTab === "Admin" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Admin Verification lock screen if not unlocked */}
                {!adminUnlocked ? (
                  <div className="max-w-md mx-auto bg-stone-900 p-6 rounded-2xl border border-red-900/40 shadow-2xl space-y-6 text-center">
                    <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black tracking-widest text-stone-100 uppercase">ADMIN KIRISH HUQUQI</h3>
                      <p className="text-xs text-stone-500 leading-tight">Yopiq panelni ochish uchun ikkala parol kodini bir vaqtda kiriting.</p>
                    </div>

                    <div className="space-y-3.5 text-left text-xs">
                      <div>
                        <label className="block text-stone-400 font-semibold mb-1">1-Parol:</label>
                        <input 
                          type="password" 
                          placeholder="Parol kod 1..."
                          value={pass1}
                          onChange={(e) => setPass1(e.target.value)}
                          className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-600 focus:outline-none rounded-lg text-stone-300"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 font-semibold mb-1">2-Parol:</label>
                        <input 
                          type="password" 
                          placeholder="Parol kod 2..."
                          value={pass2}
                          onChange={(e) => setPass2(e.target.value)}
                          className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-650 focus:outline-none rounded-lg text-stone-300"
                        />
                      </div>
                    </div>

                    {adminIncorrect && (
                      <p className="text-[11px] text-red-500 font-bold leading-none">❌ XAVFSIZLIK PAROLI NOTOG'RI KIRITILDI!</p>
                    )}

                    <button 
                      onClick={handleAdminVerify}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Xavfsiz Kirish
                    </button>
                  </div>
                ) : (
                  
                  /* Admin Panel Contents if Unlocked */
                  <div className="space-y-6">
                    
                    {/* Header showing 4-hourcountdown Timer */}
                    <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-red-500" />
                        <div>
                          <h3 className="text-sm font-black text-stone-200 uppercase">ADMIN HUQUQLARI FAOLLASHTIRILGAN</h3>
                          <p className="text-xs text-stone-400 font-mono">Xavfsiz sessiya amal qilish vaqti.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest">AVTOMAT QULFLANISh:</span>
                        <div className="bg-stone-950 p-2.5 rounded-lg border border-red-900/50 text-red-400 font-black tracking-widest text-sm text-center">
                          {formatTime(adminLockTimeLeft)}
                        </div>
                        <button 
                          onClick={() => { setAdminUnlocked(false); setToast("Admin paneli qulflandi."); }}
                          className="px-3 py-1 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 text-xs font-bold rounded transition-colors cursor-pointer"
                        >
                          Chiqish
                        </button>
                      </div>
                    </div>

                    {/* TWO SUB-MODULES OF ADMIN: 1. EDIT / DELETE; 2. USERS MANAGER */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Sub-module 1: Mangani taxrirlash, o'chirish */}
                      <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-xs font-black tracking-widest text-red-500 uppercase pb-2 border-b border-stone-800">
                          1. MANGALARNI TAHRIRLASH WA O'CHIRISH
                        </h3>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {mangas.map((m) => (
                            <div key={m.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex items-center justify-between gap-3 text-xs">
                              <div className="truncate">
                                <p className="font-bold text-stone-200 uppercase truncate">{m.title}</p>
                                <p className="text-[10px] text-stone-500">Muallif: {m.author} | {m.type}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button 
                                  onClick={() => {
                                    setSelectedManga(m);
                                    setActiveChapter(null);
                                    setToast(`Siz "${m.title}" batafsil tahrirlash sahifasiga o'tdingiz.`);
                                  }}
                                  className="p-1.5 bg-stone-900 hover:bg-stone-850 rounded border border-stone-800 text-stone-300"
                                >
                                  Boshqarish
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Rostdan ham ushbu mangani o'chirasizmi? barcha boblari ham yo'qoladi!`)){
                                      deleteManga(m.id);
                                      setToast("Manga tizimdan butunlay o'chirildi!");
                                    }
                                  }}
                                  className="p-1.5 bg-red-950/20 hover:bg-red-900 text-red-400 hover:text-white rounded border border-red-900/30 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-module 3.2: Adminlar & foydalanuvchilar ro'yxati */}
                      <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-xs font-black tracking-widest text-red-500 uppercase pb-2 border-b border-stone-800">
                          2. ADMInLAR VA FOYDALANUVCHILAR RO'YXATI
                        </h3>

                        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1 text-xs">
                          {allUsers.map((item) => (
                            <div key={item.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <img src={item.avatarUrl} alt="Avatar" className="w-6 h-6 rounded bg-stone-900 border border-stone-800" />
                                  <div className="truncate">
                                    <p className="font-bold text-stone-200">{item.name}</p>
                                    <p className="text-[10px] text-stone-500 truncate">{item.email}</p>
                                  </div>
                                </div>

                                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${item.role === "Admin" ? "bg-red-900/40 text-red-400 border border-red-500/30" : "bg-stone-900 text-stone-500 border border-stone-800"}`}>
                                  {item.role === "Admin" ? "Admin" : "Oddiy"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-900 text-[10px] text-stone-500 font-mono">
                                <span>ID: {item.id.slice(0, 10)}...</span>
                                <span>Balans: {item.balance.toLocaleString()} UZS</span>
                              </div>

                              {/* Operations buttons */}
                              <div className="flex items-center justify-end gap-1.5 pt-1">
                                {item.role === "Foydalanuvchi" ? (
                                  <button 
                                    onClick={() => {
                                      const updatedUsers = allUsers.map(u => u.id === item.id ? { ...u, role: "Admin" as const } : u);
                                      saveAllUsers(updatedUsers);
                                      setToast("Foydalanuvchiga ADMIN ruxsatlari berildi.");
                                    }}
                                    className="px-2 py-1 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 text-[9px] font-bold rounded cursor-pointer"
                                  >
                                    Admin huquqini berish
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      if (item.id === "SsSsS20080216") {
                                        setToast("Ega adminning huquqlari olinishi taqiqlanadi!");
                                        return;
                                      }
                                      const updatedUsers = allUsers.map(u => u.id === item.id ? { ...u, role: "Foydalanuvchi" as const } : u);
                                      saveAllUsers(updatedUsers);
                                      setToast("Adminlik huquqi bekor qilindi.");
                                    }}
                                    className="px-2 py-1 bg-stone-900 hover:bg-stone-850 text-stone-400 text-[9px] font-bold rounded cursor-pointer"
                                  >
                                    Adminlikni olish
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => {
                                    if (item.id === user?.id || item.id === "SsSsS20080216") {
                                      setToast("Xato: Ushbu amal taqiqlangan!");
                                      return;
                                    }
                                    if (confirm("Ushbu foydalanuvchini platformadan butunlay o'chirasizmi?")) {
                                      const updatedUsers = allUsers.filter(u => u.id !== item.id);
                                      saveAllUsers(updatedUsers);
                                      setToast("Foydalanuvchi butunlay o'chirildi.");
                                    }
                                  }}
                                  className="px-2 py-1 bg-transparent hover:bg-red-950 text-red-400 text-[9px] font-bold rounded cursor-pointer"
                                >
                                  O'chirish
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* ----------------- ADMIN COMPONENT M3 PILUS (+) BUTTON ----------------- */}
      {user && user.role === "Admin" && (
        <div className="fixed bottom-20 right-6 z-40">
          <button 
            onClick={() => setPlusOpen(!plusOpen)}
            className="w-14 h-14 bg-red-650 text-stone-100 rounded-full flex items-center justify-center hover:bg-red-750 hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer ring-4 ring-stone-950"
          >
            {plusOpen ? <X className="w-7 h-7" /> : <Plus className="w-8 h-8" />}
          </button>
        </div>
      )}

      {/* Creator "+" Action Dialog / Overlay */}
      {plusOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setPlusOpen(false)} className="absolute top-4 right-4 text-stone-450 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {/* Header selection tab */}
            <div className="flex border-b border-stone-800 pb-2 gap-4">
              <button 
                onClick={() => setPlusTab("manga")}
                className={`text-sm font-black uppercase tracking-wider pb-1 transition-colors relative cursor-pointer ${plusTab === "manga" ? "text-red-500" : "text-stone-400 hover:text-stone-100"}`}
              >
                Manga Qo'shish
                {plusTab === "manga" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-red-500" />}
              </button>
              <button 
                onClick={() => {
                  setPlusTab("chapter");
                  if (mangas.length > 0 && !targetMangaId) setTargetMangaId(mangas[0].id);
                }}
                className={`text-sm font-black uppercase tracking-wider pb-1 transition-colors relative cursor-pointer ${plusTab === "chapter" ? "text-red-500" : "text-stone-400 hover:text-stone-100"}`}
              >
                BOB (Chapter) Qo'shish
                {plusTab === "chapter" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-red-500" />}
              </button>
            </div>

            {/* 6.2 Manga Register Form */}
            {plusTab === "manga" && (
              <form onSubmit={handleAddMangaSubmit} className="space-y-4 text-xs text-stone-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="col-span-full">
                    <label className="block text-stone-400 font-bold mb-1">Manga Nomlanishi (Sarlavha):</label>
                    <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-600 focus:outline-none rounded-lg" placeholder="O'zbekcha yorqin va qisqa nom..." />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-stone-400 font-bold mb-1 font-sans">Tavsif (Description):</label>
                    <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-600 focus:outline-none rounded-lg placeholder-stone-600" placeholder="Syujet tafsilotlari..." />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Muallif (Author):</label>
                    <input type="text" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg placeholder-stone-600 focus:border-red-500" placeholder="Chugong..." />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Studiya:</label>
                    <input type="text" value={newStudio} onChange={(e) => setNewStudio(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg placeholder-stone-600 focus:border-red-500" placeholder="Redice Studio..." />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Yuklangan yili:</label>
                    <input type="number" value={newYear} onChange={(e) => setNewYear(parseInt(e.target.value) || 2026)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Turi (Manga / Manhwa / Manhua):</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg">
                      <option value="Manga">Manga (Yaponiya)</option>
                      <option value="Manhwa">Manhwa (Koreya)</option>
                      <option value="Manhua">Manhua (Xitoy)</option>
                      <option value="Novella">Novella (Hikoya)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Manga holati:</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg">
                      <option value="Davom etmoqda">Davom etmoqda (Ongoing)</option>
                      <option value="Tugallangan">Tugallangan (Completed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1 text-red-500">Manga to'lov turi:</label>
                    <select value={newBilling} onChange={(e) => setNewBilling(e.target.value as any)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg text-red-400 font-bold">
                      <option value="Bepul">Bepul (Moyli yashil)</option>
                      <option value="Obuna">Obuna (Vibrant qizil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Jildlar soni (0 bo'lsa yo'q):</label>
                    <input type="number" value={newVolumes} onChange={(e) => setNewVolumes(parseInt(e.target.value) || 0)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Fasllar soni (0 bo'lsa yo'q):</label>
                    <input type="number" value={newSeasons} onChange={(e) => setNewSeasons(parseInt(e.target.value) || 0)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-stone-400 font-bold mb-1">Cover Artwork Rasm havolasi (URL yoki rang):</label>
                    <input type="text" value={newCover} onChange={(e) => setNewCover(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-600 rounded-lg placeholder-stone-600" placeholder="Havola kiritilmasa tasodifiy ajoyib ranglar o'rnatiladi..." />
                  </div>

                  <div className="col-span-full space-y-1.5">
                    <span className="block text-stone-400 font-bold font-sans">Janrlardan keraklilarini tanlang:</span>
                    <div className="flex flex-wrap gap-1 bg-stone-950 p-3 rounded-lg border border-stone-800">
                      {genres.map((g) => {
                        const hasIdx = newGenresList.includes(g);
                        return (
                          <button 
                            key={g}
                            type="button"
                            onClick={() => {
                              setNewGenresList(prev => hasIdx ? prev.filter(item => item !== g) : [...prev, g]);
                            }}
                            className={`p-1.5 text-[10px] sm:text-xs rounded font-bold uppercase transition-all cursor-pointer ${hasIdx ? "bg-red-650 text-white" : "bg-stone-900 text-stone-400 hover:text-stone-200"}`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  <button type="button" onClick={() => setPlusOpen(false)} className="px-4 py-2 bg-stone-950 hover:bg-stone-800 rounded-lg font-semibold text-stone-400">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg uppercase shadow">Manga Qo'shish</button>
                </div>
              </form>
            )}

            {/* 6.3 Bob register form */}
            {plusTab === "chapter" && (
              <form onSubmit={handleAddChapterSubmit} className="space-y-4 text-xs text-stone-300">
                
                {/* Select target manga */}
                <div className="space-y-1">
                  <label className="block text-stone-400 font-bold mb-1">Kerakli mangani tanlang:</label>
                  <select 
                    value={targetMangaId} 
                    onChange={(e) => setTargetMangaId(e.target.value)}
                    className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:border-red-600 text-stone-200 rounded-lg font-bold"
                  >
                    {mangas.map(m => (
                      <option key={m.id} value={m.id}>{m.title} ({m.type})</option>
                    ))}
                  </select>
                </div>

                {/* Banner review indicator as mandated */}
                {targetMangaId && (
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-3.5 text-xs text-stone-300">
                    <div className="w-10 h-14 bg-red-900 shrink-0 rounded flex items-center justify-center font-extrabold text-white text-[10px] tracking-widest text-center">
                      MANGA
                    </div>
                    <div>
                      <p className="text-[10px] text-red-400 font-bold tracking-wider">TANLANGAN MANGA REVIEW:</p>
                      <p className="font-extrabold text-stone-100">{mangas.find(m => m.id === targetMangaId)?.title}</p>
                      <p className="text-[9px] text-stone-400 font-sans truncate">Muallif: {mangas.find(m => m.id === targetMangaId)?.author}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Mavsum (Fasl) no:</label>
                    <input type="number" value={chSeason} onChange={(e) => setChSeason(parseInt(e.target.value) || 0)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" placeholder="Masalan: 1..." />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Jild (Volume) no:</label>
                    <input type="number" value={chVolume} onChange={(e) => setChVolume(parseInt(e.target.value) || 0)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" placeholder="Masalan: 4..." />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1 text-red-500">BOB Qismi (CHAPTER) *:</label>
                    <input type="text" required value={chNum} onChange={(e) => setChNum(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-red-500/30 rounded-lg" placeholder="Masalan: 55-bob..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-stone-400 font-bold mb-1">Bob Maxsus Sarlavhasi (Ixtiyoriy):</label>
                    <input type="text" value={chTitle} onChange={(e) => setChTitle(e.target.value)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" placeholder="Masalan: Katta burilish nuqtasi..." />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Generatsiya sahifalar soni:</label>
                    <input type="number" value={customPagesCount} onChange={(e) => setCustomPagesCount(parseInt(e.target.value) || 5)} className="w-full bg-stone-950 p-2.5 border border-stone-800 rounded-lg" />
                  </div>
                </div>

                {/* PDF and Multi Image upload simulation design as requested */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center space-y-3">
                  <div className="p-3 bg-stone-900 border-2 border-dashed border-stone-800 rounded-lg space-y-1">
                    <Upload className="w-6 h-6 text-stone-500 mx-auto" />
                    <p className="text-[11px] font-bold text-stone-350">Manga Sahifalari / PDF Faylini tanlang</p>
                    <p className="text-[9px] text-stone-500">Ilova PDF fayllaridan varaqlarini avtomat PNG qilib oladi</p>
                  </div>
                  
                  {/* Select File Box trigger simulation */}
                  <input 
                    type="file" 
                    accept="application/pdf, image/*" 
                    multiple
                    className="hidden text-xs text-stone-400 mx-auto" 
                    id="mock-uploader"
                    onChange={() => {
                      setToast("Fayllar topildi! Quyidagi 'Bob Qo'shish' tugmasini bosing.");
                    }}
                  />
                  <label htmlFor="mock-uploader" className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-300 font-bold text-[10px] rounded cursor-pointer inline-block">
                    Galereyadan Yuklash / Drag - Drop PDF
                  </label>

                  {pdfUploadPercent !== null && (
                    <div className="space-y-1 text-center">
                      <p className="text-[9px] text-red-500 font-extrabold animate-pulse">PDF fayli tahlil qilinmoqda [{pdfUploadPercent}%]</p>
                      <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${pdfUploadPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  <button type="button" onClick={() => setPlusOpen(false)} className="px-4 py-2 bg-stone-950 hover:bg-stone-800 rounded-lg font-semibold text-stone-400">Yopish</button>
                  <button type="submit" className="px-5 py-2 bg-red-650 hover:bg-red-750 text-white font-extrabold rounded-lg uppercase shadow">Bob Qo'shish</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ----------------- SUB-MODALS (PROFILE SUB-Amallar) ----------------- */}
      
      {/* 5.10 Profile Edit Modal */}
      {profileEditOpen && user && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleProfileUpdate} className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black tracking-widest text-red-500 uppercase">PROFIL Ma'lumotlarini tahrirlash</h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 font-bold mb-1">Nikname / Ismingiz:</label>
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-850 rounded-lg text-stone-200 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-1.5">Avatar rasm tanlang (Qalam orqali):</label>
                <div className="grid grid-cols-4 gap-2 bg-stone-950 p-3 rounded-lg">
                  {["Tiger", "Dragon", "Panda", "Fox"].map((seed) => {
                    const sampleUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                    const activeImg = user.avatarUrl.includes(seed);
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setUser(prev => prev ? { ...prev, avatarUrl: sampleUrl } : null)}
                        className={`p-1 bg-stone-900 border rounded-lg hover:border-red-600 cursor-pointer ${activeImg ? "border-red-605 bg-red-950/20" : "border-stone-800"}`}
                      >
                        <img src={sampleUrl} alt="Avatar choose" className="w-full h-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button type="button" onClick={() => setProfileEditOpen(false)} className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 rounded text-stone-400">Orqaga</button>
              <button type="submit" className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded">Saqlash</button>
            </div>
          </form>
        </div>
      )}

      {/* Sirli ID Ma'lumotlari (Modal 5.9) */}
      {profileIdCheckOpen && user && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-stone-850">
              <h3 className="text-sm font-black tracking-widest text-red-500 uppercase flex items-center gap-1.5">
                <Shield className="w-5 h-5" />
                ID ma'lumotlari markazi
              </h3>
              <button onClick={() => { setProfileIdCheckOpen(false); setIdInputVal(""); setIdResultText(null); setMegaAdminStep(1); setMegaEmailInput(""); setMegaOtpInput(""); }} className="text-stone-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {megaAdminStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-stone-400 font-semibold">Foydalanuvchi ID raqamini kiriting:</label>
                  <input 
                    type="text"
                    value={idInputVal}
                    placeholder="Masalan: 443267..."
                    onChange={(e) => setIdInputVal(e.target.value)}
                    className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:outline-none focus:border-red-600 rounded-lg font-mono text-center text-stone-300"
                  />
                </div>

                {megaError && <p className="text-[11px] text-red-500 text-center font-bold font-sans">{megaError}</p>}

                <button 
                  onClick={handleLookUpID}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Taqqoslash va Tekshirish
                </button>

                {idResultText && (
                  <div className="bg-stone-950 p-4 border border-stone-850 rounded-xl space-y-3">
                    <p className="font-extrabold text-stone-300">Yuborilgan ID o'qish tarixi:</p>
                    <p className="text-stone-400">Umumiy o'qilgan mangalar: <strong className="text-red-500 font-extrabold">{idResultText.count} ta</strong></p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {idResultText.list.length > 0 ? (
                        idResultText.list.map((mTitle, i) => (
                          <div key={i} className="p-1 px-2.5 bg-stone-900 border border-stone-800 text-[10px] text-stone-300 uppercase truncate">
                            {i+1}. {mTitle}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-stone-500 italic">Hali birorta asar o'qilmagan.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {megaAdminStep === 2 && (
              <div className="space-y-4 text-xs">
                <p className="text-sm font-semibold text-stone-200">Admin tasdiqlash uchun Emailingizni kiriting:</p>
                <input 
                  type="email"
                  value={megaEmailInput}
                  placeholder="ShadowSoya8@gmail.com..."
                  onChange={(e) => setMegaEmailInput(e.target.value)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:outline-none focus:border-red-650 rounded-lg text-stone-300"
                />
                {megaError && <p className="text-[11px] text-red-500 font-bold text-center">{megaError}</p>}
                <button 
                  onClick={handleAdminEmailSubmit}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Tasdiqlash kodi jo'natish
                </button>
              </div>
            )}

            {megaAdminStep === 3 && (
              <div className="space-y-4 text-xs">
                <p className="text-sm font-semibold text-stone-200 text-center">Tizim tasdiqlash kodini kiriting (Pochtangizdagi kod: 2026):</p>
                <input 
                  type="text"
                  value={megaOtpInput}
                  placeholder="Kodni yozing..."
                  onChange={(e) => setMegaOtpInput(e.target.value)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-800 focus:outline-none focus:border-red-650 rounded-lg text-center font-bold tracking-wider text-stone-300 text-base"
                />
                {megaError && <p className="text-[11px] text-red-500 font-bold text-center">{megaError}</p>}
                <button 
                  onClick={handleAdminOtpSubmit}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl cursor-pointer shadow"
                >
                  Ega Rolini Faollashtirish ✨
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Hisobni To'ldirish (Hamyon / Recharge Modal) */}
      {rechargeOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRechargeSubmit} className="bg-stone-900 border border-stone-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black tracking-widest text-emerald-500 uppercase">Hisobni to'ldirish (UZS)</h3>
            
            <div className="space-y-3.5 text-xs text-stone-300">
              <div>
                <label className="block text-stone-400 font-bold mb-1 font-sans">To'ldirish summasini belgilang:</label>
                <select 
                  value={rechargeAmt}
                  onChange={(e) => setRechargeAmt(e.target.value)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-850 rounded-lg font-bold text-emerald-400"
                >
                  <option value="">Tanlang...</option>
                  <option value="15000">15,000 UZS</option>
                  <option value="30000">30,000 UZS</option>
                  <option value="50000">50,000 UZS</option>
                  <option value="100000">100,000 UZS</option>
                </select>
              </div>

              <div className="p-3 bg-stone-950 rounded-lg text-[9px] text-stone-500 space-y-1">
                <p className="font-extrabold text-stone-400">💳 Sinov uchun virtual to'lov kartasi:</p>
                PAYME va CLICK milliy to'lov provayderi orqali hisoblanadi.
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button type="button" onClick={() => setRechargeOpen(false)} className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 rounded text-stone-400 font-semibold">Orqaga</button>
              <button type="submit" disabled={!rechargeAmt} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded disabled:opacity-40">Mablag' qo'shish</button>
            </div>
          </form>
        </div>
      )}

      {/* Obuna olish (Subscription modal dialog) */}
      {subOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-widest text-stone-100 uppercase">MONTHLY VIP PREMIUM OBUNA</h3>
              <p className="text-xs text-stone-400 leading-tight">Cheksiz darajada barcha pullik ranti mangalari boblarini o'qing.</p>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-2">
              <p className="text-stone-500 text-[10px] uppercase font-bold">OBUNA NARXI</p>
              <p className="text-2xl font-black text-red-500">25,000 UZS / oyiga</p>
              {user && (
                <p className="text-[10px] text-stone-400">Sizning balansingiz: <strong className="text-stone-200">{user.balance.toLocaleString()} UZS</strong></p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button 
                onClick={buyPremiumSubscription}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg uppercase tracking-wider cursor-pointer shadow"
              >
                Balansdan to'lash (Faollashtirish)
              </button>
              <button 
                onClick={() => setSubOpen(false)}
                className="w-full py-2 bg-stone-950 hover:bg-stone-850 text-stone-500 font-semibold rounded-lg"
              >
                Muassasa bo'limini yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjimonlik form (Translator Request modal) */}
      {translatorOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleTranslatorSubmit} className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black tracking-widest text-red-500 uppercase pb-2 border-b border-stone-850 flex items-center gap-1.5">
              <Languages className="w-5 h-5 text-red-500" />
              Tarjimonlik arizasi yuborish
            </h3>
            
            <div className="space-y-3 text-xs text-stone-300">
              <div>
                <label className="block text-stone-400 font-bold mb-1">Manga tarjima qilish bo'yicha tajribangiz:</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: 1 yil, turli kanallar yoki guruhlarda..."
                  value={transExp}
                  onChange={(e) => setTransExp(e.target.value)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-850 rounded-lg text-stone-200 focus:outline-none focus:border-red-650"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-1">O'zingiz va biladigan tillaringiz haqida qisqacha:</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Koreys yoki ingliz tilidan o'zbekchaga sifatli tarjima..."
                  value={transBio}
                  onChange={(e) => setTransBio(e.target.value)}
                  className="w-full bg-stone-950 p-2.5 border border-stone-850 rounded-lg text-stone-200 focus:outline-none focus:border-red-650 placeholder-stone-600"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-lg text-[10px] text-stone-500 leading-tight">
                💡 <strong className="text-stone-400">Eslatma:</strong> Arizangiz tasdiqlansa, sizda manga va bob qo'shish huquqi faollashadi.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setTranslatorOpen(false)} className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 rounded text-stone-400 font-semibold cursor-pointer">Orqaga</button>
              <button type="submit" className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded cursor-pointer">Ariza yuborish</button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Hub View */}
      {notificationsOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-stone-850">
              <h3 className="text-sm font-black tracking-widest text-red-500 uppercase flex items-center gap-1.5">
                <Bell className="w-5 h-5 text-red-500" />
                Bildirishnomalar
              </h3>
              <button onClick={() => setNotificationsOpen(false)} className="text-stone-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-stone-950 rounded-xl border border-stone-850 text-xs text-stone-300 relative">
                    <p className="font-extrabold text-stone-200 mb-0.5">{n.title}</p>
                    <p className="text-stone-400 text-[10px] leading-tight">{n.message}</p>
                    <p className="text-[8px] text-stone-605 text-right font-semibold mt-1">Hozir</p>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-stone-500 text-xs italic">Bildirishnomalar mavjud emas.</p>
              )}
            </div>

            <div className="text-right">
              <button 
                onClick={() => setNotificationsOpen(false)}
                className="px-4 py-1.5 bg-stone-950 hover:bg-stone-850 text-stone-300 text-xs font-bold rounded cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM NAVIGATION TABS CONTROLLER (4 Tab + Admin hidden toggle) ----------------- */}
      <nav className="fixed bottom-0 inset-x-0 bg-stone-950/95 backdrop-blur-md border-t border-stone-900 px-3 py-2 z-40 flex items-center justify-around pb-safe">
        
        {/* Asosiy */}
        <button 
          onClick={() => { setActiveTab("Asosiy"); setSelectedManga(null); setActiveChapter(null); }}
          className={`flex flex-col items-center gap-1 py-1 text-center font-bold tracking-wider transition-all cursor-pointer ${activeTab === "Asosiy" ? "text-red-500" : "text-stone-400 hover:text-stone-200"}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Asosiy</span>
        </button>

        {/* Qidiruv */}
        <button 
          onClick={() => { setActiveTab("Qidiruv"); setSelectedManga(null); setActiveChapter(null); }}
          className={`flex flex-col items-center gap-1 py-1 text-center font-bold tracking-wider transition-all cursor-pointer ${activeTab === "Qidiruv" ? "text-red-510" : "text-stone-400 hover:text-stone-100"}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Qidirish</span>
        </button>

        {/* Saqlanganlar */}
        <button 
          onClick={() => { setActiveTab("Saqlanganlar"); setSelectedManga(null); setActiveChapter(null); }}
          className={`flex flex-col items-center gap-1 py-1 text-center font-bold tracking-wider transition-all cursor-pointer relative ${activeTab === "Saqlanganlar" ? "text-red-500" : "text-stone-400 hover:text-stone-100"}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">Saqlanganlar</span>
          {favorites.length > 0 && (
            <span className="absolute top-0.5 right-6 w-2 h-2 bg-red-650 rounded-full" />
          )}
        </button>

        {/* Profile */}
        <button 
          onClick={() => { setActiveTab("Profil"); setSelectedManga(null); setActiveChapter(null); }}
          className={`flex flex-col items-center gap-1 py-1 text-center font-bold tracking-wider transition-all cursor-pointer ${activeTab === "Profil" ? "text-red-500" : "text-stone-400 hover:text-stone-100"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>

        {/* 5th Tab: Admin panel - Only visible to logged in administrators/Egas */}
        {user && user.role === "Admin" && (
          <button 
            onClick={() => { setActiveTab("Admin"); setSelectedManga(null); setActiveChapter(null); }}
            className={`flex flex-col items-center gap-1 py-1 text-center font-bold tracking-wider transition-all cursor-pointer ${activeTab === "Admin" ? "text-red-500" : "text-stone-400 hover:text-stone-100"}`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">Admin Panel</span>
          </button>
        )}

      </nav>

    </div>
  );
}
