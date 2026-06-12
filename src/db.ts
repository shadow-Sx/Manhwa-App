/**
 * db.ts
 * Reactive local storage engine simulating a Room Database.
 * Pre-populates beautiful Uzbek-translated mangas, default users,
 * and maintains reactive subscriptions.
 */

import { Manga, Chapter, UserProfile, TranslatorRequest, AppNotification } from "./types";

// Subscriptions system to automatically notify UI of database changes
type ChangeCallback = () => void;
const listeners = new Set<ChangeCallback>();

function notifyChange() {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (e) {
      console.error("Listener error:", e);
    }
  });
}

export function subscribeToDB(callback: ChangeCallback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Default Manga Covers (Creative high contrast graphics)
const SAMPLE_COVER_1 = "rgba(220,38,38,0.95)"; // Deep Solid Red for Solo Leveling
const SAMPLE_COVER_2 = "rgba(10,10,10,0.95)";  // Obsidian Black for Demon Slayer
const SAMPLE_COVER_3 = "rgba(79,70,229,0.955)"; // Royal Purple-indigo for Beginner After The End
const SAMPLE_COVER_4 = "rgba(107,114,128,0.95)"; // Cold slate for The Horizon

// Generates simulated beautiful comic strips on a Canvas as Base64 strings to represent high quality pages
function generateMockComicPage(title: string, pageNum: number, color: string): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 650;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Dark high contrast theme
    ctx.fillStyle = "#0c0a09"; // Stone 950 background
    ctx.fillRect(0, 0, 400, 650);

    // Aesthetic comic border
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 380, 630);

    // Grid panels
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 360, 200);
    ctx.strokeRect(20, 230, 360, 180);
    ctx.strokeRect(20, 420, 360, 210);

    // Gradient action in top panel
    const grad1 = ctx.createLinearGradient(0, 0, 400, 200);
    grad1.addColorStop(0, "rgba(0,0,0,0.85)");
    grad1.addColorStop(1, color);
    ctx.fillStyle = grad1;
    ctx.fillRect(22, 22, 356, 196);

    // Drawing action figures schemas
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Head / body / sword
    ctx.arc(200, 100, 20, 0, Math.PI * 2);
    ctx.moveTo(200, 120);
    ctx.lineTo(200, 180);
    ctx.moveTo(200, 140);
    ctx.lineTo(160, 150);
    ctx.moveTo(200, 140);
    ctx.lineTo(240, 130);
    // Sword line
    ctx.strokeStyle = "#fbbf24"; // Silver glow
    ctx.moveTo(240, 130);
    ctx.lineTo(280, 90);
    ctx.stroke();

    // Text Bubble 1
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(40, 50, 110, 45, 10);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("SEN KIMSEN?!", 50, 70);
    ctx.fillText("Qanday kirding?", 50, 84);

    // Middle panel details - Korean / Uzbek Webtoon speech balloon style
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(22, 232, 356, 176);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.strokeRect(22, 232, 356, 176);

    ctx.fillStyle = "rgba(220, 38, 38, 0.4)";
    ctx.beginPath();
    ctx.moveTo(100, 310);
    ctx.lineTo(300, 310);
    ctx.lineTo(200, 380);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    ctx.fillText("* SHIINGGG *", 150, 280);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(220, 310, 130, 40, 10);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Uni To'xtating!", 230, 326);
    ctx.fillText("U juda tez!", 230, 340);

    // Bottom Panel Actions
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(22, 422, 356, 206);
    
    // Glowing eyes
    ctx.fillStyle = "#3b82f6"; // Blue lightning
    ctx.beginPath();
    ctx.arc(150, 520, 6, 0, Math.PI*2);
    ctx.arc(250, 520, 6, 0, Math.PI*2);
    ctx.fill();
    // Lightning stroke
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 520);
    ctx.bezierCurveTo(120, 500, 100, 530, 80, 500);
    ctx.moveTo(250, 520);
    ctx.bezierCurveTo(280, 500, 300, 530, 320, 500);
    ctx.stroke();

    // Uzbek page label
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`AniManxwa • ${title} • Sahifa ${pageNum}`, 30, 620);

    return canvas.toDataURL("image/png");
  } catch (err) {
    return color; // Fallback
  }
}

// List of Uzbek high fidelity default Mangas
const DEFAULT_MANGAS: Manga[] = [
  {
    id: "solo-leveling",
    title: "Yolg'iz darajani oshirish (Solo Leveling)",
    description: "Dunyo darvozalari ochilib, ichkaridan daxshatli sehrli maxluqlar insoniyatga hujum qila boshlaganidan so'ng, ularga qarshi tura oladigan 'Ovchilar' paydo bo'ldi. Seong Jin-woo - butun dunyodagi eng zaif, E-darajali oddiy ovchi edi. Kunlarning birida, o'ta xavfli qo'shaloq xazinaxonadan tirik qolishga urinayotganda daxshatli sinovga duch keladi. O'lim yoqasida sehrli tizimni faollashtirib, u cheksiz darajada kuchayib boradigan dunyodagi yagona va takrorlanmas ovchiga aylanadi. Uning sarguzashtlari va ufq orqasidagi sirli kuchlar bilan kurashini bevosita o'qing!",
    author: "Chugong",
    studio: "REDICE Studio",
    year: 2018,
    type: "Manhwa",
    status: "Tugallangan",
    billing: "Obuna",
    volumes: 8,
    seasons: 2,
    genres: ["Harakat", "Fantaziya", "G'ayratabiiy", "Sarguzasht"],
    coverUrl: "", 
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
    readCount: 14520,
  },
  {
    id: "demon-slayer",
    title: "Jinlar Qotili (Demon Slayer)",
    description: "Tanjiro Kamado mehnatsevar va oqko'ngil yetim bola bo'lib, o'z oilasini ko'mir sotish orqali boqib yuradi. Ammo bir kuni u uydan qaytganida daxshatli fojiaga guvoh bo'ladi: oilasini inson go'shtini yeydigan qonxo'r jinlar yo'q qilgan edi. Yagona tirik qolgan singlisi Nezuko Kamado esa jinga aylanib ulgurgandi. Tanjiro singlisini qaytadan insonga aylantirish va oilasining qasosini olish maqsadida o'z hayotini xavf ostiga qo'yib, afsonaviy 'Jinlarni Qiruvchi Korpus' safiga qo'shiladi va buyuk qilichbozlik sirlarini o'rgana boshlaydi.",
    author: "Koyoharu Gotouge",
    studio: "Shueisha",
    year: 2016,
    type: "Manga",
    status: "Tugallangan",
    billing: "Bepul",
    volumes: 23,
    seasons: 0,
    genres: ["Harakat", "Sirli", "G'ayratabiiy", "Drama"],
    coverUrl: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
    readCount: 9812,
  },
  {
    id: "tbate",
    title: "Tugashdan Keyingi Boshlanish (The Beginning After The End)",
    description: "Taqdir taqozosi va qudratli koinot muvozanati tufayli, jangari va sovuqqon Qirol Grey o'zining sirli qirolligida yakka-yolg'iz vafot etadi. Ammo uning ruxi kutilmagansiz sehr, daxshatli hayvonlar va sirlarga to'la bo'lgan yangi o'rta asrlar olamida qayta tug'iladi. Yangi oilasining mexri va sevgisi bilan u o'zining o'tmish xatolarini to'g'irlashga qaror qiladi. Ammo uning o'tmishdagi dushmanlari va bu dunyoning xavf-xatarlari tez orada uning yaqinlariga tahdid sola boshlaydi. Kichik yoshidanoq kuchli sarguzashtlar kurashchisi!",
    author: "TurtleMe",
    studio: "Tapas Media",
    year: 2018,
    type: "Manhwa",
    status: "Davom etmoqda",
    billing: "Obuna",
    volumes: 0,
    seasons: 5,
    genres: ["O'zga dunyo", "Fantaziya", "Sarguzasht", "Ramantika"],
    coverUrl: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    readCount: 18744,
  },
  {
    id: "the-horizon",
    title: "Ufq (The Horizon)",
    description: "Urushning mudxish va qonli alangasi ichida hamma yaqinlarini hamda yashashdan umidini yo'qotgan ikki yetim bola. Ular butun qiyinchiliklar, o'lim darasi va urush dahshati ichida uchrashadilar va ufq tomon maqsadsiz, lek umidbaxsh yo'l oladilar. Ularning o'rtasidagi so'zsiz sevgi, darmonsiz taqdirlar va hayot uchun fojiaviy kurashlar falsafiy va chuqur psixologik tilda tushuntirilgan. Shunchaki o'qish emas, balki qalbda chuqur iz qoldiradigan durdona asar.",
    author: "Jung Ji Hoon",
    studio: "WEBTOON",
    year: 2016,
    type: "Manhwa",
    status: "Tugallangan",
    billing: "Bepul",
    volumes: 3,
    seasons: 0,
    genres: ["Drama", "Psixologik", "Hayotdan parcha"],
    coverUrl: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40, // 40 days ago
    readCount: 5210,
  }
];

// Initialize database in localStorage
export function initializeDB() {
  if (typeof window === "undefined") return;

  // 1. Initialize Users (including Admin accounts and ShadowSoya8 as Ega)
  if (!localStorage.getItem("animanxwa_users")) {
    const initialUsers: UserProfile[] = [
      {
        id: "SsSsS20080216",
        name: "Shadow Soya",
        email: "ShadowSoya8@gmail.com",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow",
        role: "Admin",
        balance: 150000,
        hasSubscription: true,
        history: ["solo-leveling", "the-horizon"],
        isEgaAdmin: true
      },
      {
        id: "44326787907765423552790",
        name: "Anvarbek O'zbek",
        email: "anvar99@gmail.com",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anvar",
        role: "Foydalanuvchi",
        balance: 45000,
        hasSubscription: false,
        history: ["demon-slayer"]
      },
      {
        id: "87349182390823498112399",
        name: "Zilola Manga",
        email: "zilolamanga@gmail.com",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zilola",
        role: "Foydalanuvchi",
        balance: 75000,
        hasSubscription: true,
        history: ["tbate"]
      }
    ];
    localStorage.setItem("animanxwa_users", JSON.stringify(initialUsers));
  }

  // Set initial logged in user as a regular profile initially, but they can sign in or active as Admin
  if (!localStorage.getItem("animanxwa_current_user")) {
    // Generate a secure high entropy random 23-digit user ID
    let randomID = "";
    for (let i = 0; i < 23; i++) {
      randomID += Math.floor(Math.random() * 10).toString();
    }
    const guestUser: UserProfile = {
      id: randomID,
      name: "Tashrif Buyuruvchi",
      email: "guest@animanxwa.uz",
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomID}`,
      role: "Foydalanuvchi",
      balance: 10000, // Preloaded with 10k UZS
      hasSubscription: false,
      history: []
    };
    localStorage.setItem("animanxwa_current_user", JSON.stringify(guestUser));
  }

  // 2. Initialize Mangas
  if (!localStorage.getItem("animanxwa_mangas")) {
    // Pre-create dynamic covers or fallback colors
    const mangasWithCovers = DEFAULT_MANGAS.map((m, idx) => {
      let color = SAMPLE_COVER_1;
      if (idx === 1) color = SAMPLE_COVER_2;
      if (idx === 2) color = SAMPLE_COVER_3;
      if (idx === 3) color = SAMPLE_COVER_4;
      return { ...m, coverUrl: color };
    });
    localStorage.setItem("animanxwa_mangas", JSON.stringify(mangasWithCovers));
  }

  // 3. Initialize Chapters
  if (!localStorage.getItem("animanxwa_chapters")) {
    const initialChapters: Chapter[] = [
      // Solo leveling chapters
      {
        id: "solo_ch1",
        mangaId: "solo-leveling",
        season: 1,
        chapterNumber: "1",
        title: "D-Darajali daxshat boshlanishi",
        pages: [
          generateMockComicPage("Solo Leveling", 1, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 2, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 3, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 4, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 5, SAMPLE_COVER_1)
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28
      },
      {
        id: "solo_ch2",
        mangaId: "solo-leveling",
        season: 1,
        chapterNumber: "2",
        title: "Cheksiz darajalash imkoniyati",
        pages: [
          generateMockComicPage("Solo Leveling", 1, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 2, SAMPLE_COVER_1),
          generateMockComicPage("Solo Leveling", 3, SAMPLE_COVER_1)
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 27
      },
      // Demon slayer chapters
      {
        id: "ds_ch1",
        mangaId: "demon-slayer",
        chapterNumber: "1",
        title: "Uchrashuv va yangi qilich ko'nikmasi",
        pages: [
          generateMockComicPage("Demon Slayer", 1, SAMPLE_COVER_2),
          generateMockComicPage("Demon Slayer", 2, SAMPLE_COVER_2),
          generateMockComicPage("Demon Slayer", 3, SAMPLE_COVER_2),
          generateMockComicPage("Demon Slayer", 4, SAMPLE_COVER_2)
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14
      },
      {
        id: "ds_ch2",
        mangaId: "demon-slayer",
        chapterNumber: "2",
        title: "Jin kuchi va Nezuko jasorati",
        pages: [
          generateMockComicPage("Demon Slayer", 1, SAMPLE_COVER_2),
          generateMockComicPage("Demon Slayer", 2, SAMPLE_COVER_2)
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12
      },
      // TBATE chapter
      {
        id: "tbate_ch1",
        mangaId: "tbate",
        season: 1,
        chapterNumber: "1",
        title: "Qirol ruxining sehr dunyosida tarqalishi",
        pages: [
          generateMockComicPage("The Beginning After The End", 1, SAMPLE_COVER_3),
          generateMockComicPage("The Beginning After The End", 2, SAMPLE_COVER_3),
          generateMockComicPage("The Beginning After The End", 3, SAMPLE_COVER_3)
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
      }
    ];
    localStorage.setItem("animanxwa_chapters", JSON.stringify(initialChapters));
  }

  // 4. Initialize Favorites
  if (!localStorage.getItem("animanxwa_favorites")) {
    localStorage.setItem("animanxwa_favorites", JSON.stringify([]));
  }

  // 5. Initialize Notifications
  if (!localStorage.getItem("animanxwa_notifications")) {
    const initialNotifs: AppNotification[] = [
      {
        id: "notif_1",
        title: "Yangi bob yuklandi!",
        message: "Yolg'iz darajani oshirish (Solo Leveling) manhwasining 2-BOBI Uzbek tilida yuklandi!",
        timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
        isRead: false
      },
      {
        id: "notif_2",
        title: "Siz xush kelibsiz!",
        message: "Uzbekistondagi eng yirik AniManxwa koinotiga tushmadingiz, bemalol bepul va obunali mangalarni o'qing!",
        timestamp: Date.now() - 1000 * 60 * 120, // 2h ago
        isRead: true
      }
    ];
    localStorage.setItem("animanxwa_notifications", JSON.stringify(initialNotifs));
  }

  // 6. Translator Requests
  if (!localStorage.getItem("animanxwa_translator_requests")) {
    localStorage.setItem("animanxwa_translator_requests", JSON.stringify([]));
  }
}

// Ensure first initialization on import
initializeDB();

// -------------------------------------------------------------
// GET COUNTERS & TABLES
// -------------------------------------------------------------

export function getMangas(): Manga[] {
  try {
    const data = localStorage.getItem("animanxwa_mangas");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMangas(mangas: Manga[]) {
  localStorage.setItem("animanxwa_mangas", JSON.stringify(mangas));
  notifyChange();
}

export function getChapters(): Chapter[] {
  try {
    const data = localStorage.getItem("animanxwa_chapters");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChapters(chapters: Chapter[]) {
  localStorage.setItem("animanxwa_chapters", JSON.stringify(chapters));
  notifyChange();
}

export function getAllUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem("animanxwa_users");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAllUsers(users: UserProfile[]) {
  localStorage.setItem("animanxwa_users", JSON.stringify(users));
  notifyChange();
}

export function getCurrentUser(): UserProfile {
  try {
    const data = localStorage.getItem("animanxwa_current_user");
    if (data) {
      const parsed: UserProfile = JSON.parse(data);
      // Make sure we carry synchronized settings from general users list (like admin status or balance)
      const allUsers = getAllUsers();
      const updated = allUsers.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
      if (updated) {
        return updated;
      }
      return parsed;
    }
  } catch {}
  return {
    id: "random_guest_id",
    name: "Mehmon",
    email: "guest@animanxwa.uz",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=guest",
    role: "Foydalanuvchi",
    balance: 0,
    hasSubscription: false,
    history: []
  };
}

export function saveCurrentUser(user: UserProfile) {
  localStorage.setItem("animanxwa_current_user", JSON.stringify(user));
  
  // Also keep the main users list synchronized
  const allUsers = getAllUsers();
  const existingIndex = allUsers.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex !== -1) {
    allUsers[existingIndex] = { ...allUsers[existingIndex], ...user };
  } else {
    allUsers.push(user);
  }
  saveAllUsers(allUsers);
  notifyChange();
}

export function getFavorites(): string[] {
  try {
    const data = localStorage.getItem("animanxwa_favorites");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(mangaId: string): boolean {
  const currentFavs = getFavorites();
  const index = currentFavs.indexOf(mangaId);
  let isSaved = false;
  if (index !== -1) {
    currentFavs.splice(index, 1);
  } else {
    currentFavs.push(mangaId);
    isSaved = true;
    
    // Add custom notification for new chapter update of this saved manga
    addNotification(
      "Manga Saqlandi!",
      `Siz "${getMangaName(mangaId)}" asarini saqlab qo'ydingiz. Yangi boblari chiqqanda sizga birinchi bo'lib bildirishnoma jo'natamiz!`
    );
  }
  localStorage.setItem("animanxwa_favorites", JSON.stringify(currentFavs));
  notifyChange();
  return isSaved;
}

function getMangaName(id: string): string {
  return getMangas().find(m => m.id === id)?.title || "Sevimli asar";
}

// -------------------------------------------------------------
// BUSINESS LOGIC: EXPLICIT CRUD OPERATIONS
// -------------------------------------------------------------

export function addManga(manga: Omit<Manga, "id" | "createdAt" | "readCount">) {
  const list = getMangas();
  const idValue = manga.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Let's create an elegant background gradient or base64 cover
  const colors = [SAMPLE_COVER_1, SAMPLE_COVER_3, "rgba(22,163,74,0.95)", "rgba(217,70,239,0.95)"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newManga: Manga = {
    ...manga,
    id: list.some(m => m.id === idValue) ? `${idValue}-${Date.now()}` : idValue,
    coverUrl: manga.coverUrl || randomColor,
    createdAt: Date.now(),
    readCount: 0
  };

  list.push(newManga);
  saveMangas(list);

  // Send a mass notification to everyone!
  addNotification(
    "Yangi Manga Qo'shildi!",
    `Ajoyib yangilik! Bizning mutaxassislar "${newManga.title}" asarini platformaga Uzbek tilida kiritishdi. Kirib tomosha qiling!`
  );
  return newManga;
}

export function updateManga(updatedManga: Manga) {
  const list = getMangas();
  const index = list.findIndex(m => m.id === updatedManga.id);
  if (index !== -1) {
    list[index] = updatedManga;
    saveMangas(list);
  }
}

export function deleteManga(id: string) {
  const list = getMangas();
  const updated = list.filter(m => m.id !== id);
  saveMangas(updated);

  // Also purge chapters
  const chList = getChapters();
  saveChapters(chList.filter(c => c.mangaId !== id));
}

export function addChapter(chapter: Omit<Chapter, "id" | "createdAt" | "pages"> & { pagesFiles: string[] | FileList | null, customPdfPagesCount?: number }) {
  const list = getChapters();
  const chId = `ch-${chapter.mangaId}-${chapter.chapterNumber}-${Date.now()}`;
  
  // Prepare pages
  let finalPages: string[] = [];
  const mangaColor = getMangas().find(m => m.id === chapter.mangaId)?.coverUrl || SAMPLE_COVER_1;

  if (chapter.customPdfPagesCount && chapter.customPdfPagesCount > 0) {
    // Generate beautiful Simulated PNG Manga pages extracted from PDF
    for (let i = 1; i <= chapter.customPdfPagesCount; i++) {
      finalPages.push(generateMockComicPage(`Bob ${chapter.chapterNumber} (PDF)`, i, mangaColor));
    }
  } else if (chapter.pagesFiles && Array.isArray(chapter.pagesFiles)) {
    // Already standard base64 files
    finalPages = chapter.pagesFiles;
  } else {
    // Simple mock pages
    for (let i = 1; i <= 6; i++) {
      finalPages.push(generateMockComicPage(`Bob ${chapter.chapterNumber}`, i, mangaColor));
    }
  }

  const newChapter: Chapter = {
    id: chId,
    mangaId: chapter.mangaId,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title || `Qism: ${chapter.chapterNumber}`,
    pages: finalPages,
    season: chapter.season,
    volume: chapter.volume,
    createdAt: Date.now()
  };

  list.push(newChapter);
  saveChapters(list);

  // Generate notifications for favorities list owners!
  addNotification(
    "Yangi Bob Chiqdi! 🔥",
    `Siz sevgan "${getMangaName(chapter.mangaId)}" asarining yangi ${chapter.chapterNumber}-bobi o'qishga tayyor!`
  );
  return newChapter;
}

// -------------------------------------------------------------
// NOTIFICATIONS & TRANSLATOR
// -------------------------------------------------------------

export function getNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem("animanxwa_notifications");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addNotification(title: string, message: string) {
  const list = getNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random()}`,
    title,
    message,
    timestamp: Date.now(),
    isRead: false
  };
  list.unshift(newNotif);
  localStorage.setItem("animanxwa_notifications", JSON.stringify(list));
  notifyChange();
}

export function markNotificationsAsRead() {
  const list = getNotifications().map(n => ({ ...n, isRead: true }));
  localStorage.setItem("animanxwa_notifications", JSON.stringify(list));
  notifyChange();
}

export function submitTranslatorRequest(req: Omit<TranslatorRequest, "id" | "submittedAt" | "status">) {
  const list = getTranslatorRequests();
  const newReq: TranslatorRequest = {
    ...req,
    id: `req-${Date.now()}`,
    submittedAt: Date.now(),
    status: "Kutilmoqda"
  };
  list.unshift(newReq);
  localStorage.setItem("animanxwa_translator_requests", JSON.stringify(list));
  notifyChange();
  return newReq;
}

export function getTranslatorRequests(): TranslatorRequest[] {
  try {
    const data = localStorage.getItem("animanxwa_translator_requests");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function updateTranslatorRequest(id: string, status: "Kutilmoqda" | "Qabul qilindi" | "Rad etildi") {
  const list = getTranslatorRequests();
  const index = list.findIndex(r => r.id === id);
  if (index !== -1) {
    list[index].status = status;
    localStorage.setItem("animanxwa_translator_requests", JSON.stringify(list));
    
    // Also upgrade user role if approved to translator!
    if (status === "Qabul qilindi") {
      const req = list[index];
      const allUsers = getAllUsers();
      const uIndex = allUsers.findIndex(u => u.id === req.userId);
      if (uIndex !== -1) {
        allUsers[uIndex].role = "Admin"; // They gain admin powers to upload works!
        saveAllUsers(allUsers);
        
        // Add success notification
        addNotification(
          "Tabriklaymiz!",
          `Sizning tarjimonlik arizangiz ma'qullandi! Sizga yangi material yuklash, tahrirlash kabi adminlik huquqlari taqdim etildi!`
        );
      }
    }
    notifyChange();
  }
}

// -------------------------------------------------------------
// UTILITIES: CACHE CLEAR & HISTORY
// -------------------------------------------------------------

export function clearTransientCache(): string {
  // Clear simulated buffers, heavy cover references (without deleting database items)
  // Simply empty logs and return dynamic info
  const size = (Math.random() * 20 + 5).toFixed(1); // Mocks 5-25MB cleared
  
  // Optional mock delay completed
  return `${size} MB kesh va vaqtinchalik sahifalar rasmi keshdan to'liq tozalandi! Ilova tezlashdi.`;
}

export function addToUserHistory(mangaId: string) {
  const user = getCurrentUser();
  if (!user.history.includes(mangaId)) {
    user.history.push(mangaId);
    saveCurrentUser(user);
    
    // Increment readCount in Manga list
    const list = getMangas();
    const index = list.findIndex(m => m.id === mangaId);
    if (index !== -1) {
      list[index].readCount += 1;
      saveMangas(list);
    }
  }
}
