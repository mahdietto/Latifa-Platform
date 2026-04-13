// localStorage-based store for fables, games, users, and progress

export interface StoredFable {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  image_url: string;
  difficulty: string;
  duration: string;
  moral: string;
  story: string;
  video_url?: string;
  has_game: boolean;
  created_at: string;
}

export interface StoredGame {
  id: string;
  fable_id: string;
  game_type: string;
  title: string;
  game_data: any;
  sort_order: number;
}

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  display_name: string;
  role: "admin" | "user";
  created_at: string;
}

export interface StoredProgress {
  id: string;
  user_id: string;
  fable_id: string;
  video_watched: boolean;
  story_read: boolean;
  games_completed: string[];
  completed: boolean;
  stars: number;
  game_attempts: Record<string, number>; // gameId -> attempt count
}

const KEYS = {
  fables: "latifa_fables",
  games: "latifa_games",
  users: "latifa_users",
  progress: "latifa_progress",
  currentUser: "latifa_current_user",
};

// ─── Seed data ───
const SEED_FABLES: StoredFable[] = [
  {
    id: "f1",
    slug: "corbeau-renard",
    title: "Le Corbeau et le Renard",
    teaser: "Un corbeau tenait un fromage… Un renard rusé va le lui voler avec des flatteries.",
    image_url: "",
    difficulty: "Facile",
    duration: "3 min",
    moral: "Tout flatteur vit aux dépens de celui qui l'écoute.",
    story: "Maître Corbeau, sur un arbre perché,\nTenait en son bec un fromage.\nMaître Renard, par l'odeur alléché,\nLui tint à peu près ce langage :\n\"Hé ! bonjour, Monsieur du Corbeau.\nQue vous êtes joli ! que vous me semblez beau !\nSans mentir, si votre ramage\nSe rapporte à votre plumage,\nVous êtes le Phénix des hôtes de ces bois.\"\nÀ ces mots le Corbeau ne se sent pas de joie ;\nEt pour montrer sa belle voix,\nIl ouvre un large bec, laisse tomber sa proie.\nLe Renard s'en saisit, et dit : \"Mon bon Monsieur,\nApprenez que tout flatteur\nVit aux dépens de celui qui l'écoute :\nCette leçon vaut bien un fromage, sans doute.\"",
    has_game: true,
    created_at: "2024-01-01",
  },
  {
    id: "f2",
    slug: "cigale-fourmi",
    title: "La Cigale et la Fourmi",
    teaser: "La Cigale ayant chanté tout l'été se trouva fort dépourvue quand la bise fut venue.",
    image_url: "",
    difficulty: "Facile",
    duration: "3 min",
    moral: "Il faut travailler et épargner pour les temps difficiles.",
    story: "La Cigale, ayant chanté\nTout l'été,\nSe trouva fort dépourvue\nQuand la bise fut venue :\nPas un seul petit morceau\nDe mouche ou de vermisseau.\nElle alla crier famine\nChez la Fourmi sa voisine,\nLa priant de lui prêter\nQuelque grain pour subsister\nJusqu'à la saison nouvelle.\n\"Je vous paierai, lui dit-elle,\nAvant l'Oût, foi d'animal,\nIntérêt et principal.\"\nLa Fourmi n'est pas prêteuse :\nC'est là son moindre défaut.\n\"Que faisiez-vous au temps chaud ?\nDit-elle à cette emprunteuse.\n— Nuit et jour à tout venant\nJe chantais, ne vous déplaise.\n— Vous chantiez ? j'en suis fort aise.\nEh bien ! dansez maintenant.\"",
    has_game: true,
    created_at: "2024-01-02",
  },
  {
    id: "f3",
    slug: "lievre-tortue",
    title: "Le Lièvre et la Tortue",
    teaser: "Rien ne sert de courir, il faut partir à point. Le lièvre et la tortue en sont la preuve.",
    image_url: "",
    difficulty: "Moyen",
    duration: "4 min",
    moral: "Rien ne sert de courir, il faut partir à point.",
    story: "Rien ne sert de courir ; il faut partir à point.\nLe Lièvre et la Tortue en sont un témoignage.\n\"Gageons, dit celle-ci, que vous n'atteindrez point\nSitôt que moi ce but. — Sitôt ? Êtes-vous sage ?\nRepartit l'animal léger.\nMa commère, il vous faut purger\nAvec quatre grains d'ellébore.\n— Sage ou non, je parie encore.\"\nAinsi fut fait : et de tous deux\nOn mit près du but les enjeux.\nNotre Lièvre n'avait que quatre pas à faire.\nIl s'amusa à brouter l'herbe menue,\nà dormir et à écouter d'où venait le vent.\nLa Tortue avançait toujours et gagnait du terrain.\nEnfin il partit comme un trait ;\nMais les élans qu'il fit furent vains :\nLa Tortue arriva la première.",
    has_game: true,
    created_at: "2024-01-03",
  },
  {
    id: "f4",
    slug: "lion-rat",
    title: "Le Lion et le Rat",
    teaser: "Un petit rat sauve un puissant lion. On a souvent besoin d'un plus petit que soi.",
    image_url: "",
    difficulty: "Facile",
    duration: "3 min",
    moral: "On a souvent besoin d'un plus petit que soi.",
    story: "Il faut, autant qu'on peut, obliger tout le monde :\nOn a souvent besoin d'un plus petit que soi.\nEntre les pattes d'un Lion,\nUn Rat sortit de terre assez à l'étourdie.\nLe Roi des animaux, en cette occasion,\nMontra ce qu'il était, et lui donna la vie.\nCe bienfait ne fut pas perdu.\nQuelqu'un aurait-il jamais cru\nQu'un Lion d'un Rat eût affaire ?\nCependant il advint qu'au sortir des forêts\nCe Lion fut pris dans des rets,\nDont ses rugissements ne le purent défaire.\nSire Rat accourut, et fit tant par ses dents\nQu'une maille rongée emporta tout l'ouvrage.",
    has_game: false,
    created_at: "2024-01-04",
  },
  {
    id: "f5",
    slug: "renard-raisins",
    title: "Le Renard et les Raisins",
    teaser: "Un renard affamé aperçoit des raisins mais ne peut les atteindre.",
    image_url: "",
    difficulty: "Facile",
    duration: "2 min",
    moral: "On méprise souvent ce qu'on ne peut obtenir.",
    story: "Certain Renard Gascon, d'autres disent Normand,\nMourant presque de faim, vit au haut d'une treille\nDes Raisins mûrs apparemment,\nEt couverts d'une peau vermeille.\nLe galant en eût fait volontiers un repas ;\nMais comme il n'y pouvait atteindre :\n\"Ils sont trop verts, dit-il, et bons pour des goujats.\"\nFit-il pas mieux que de se plaindre ?",
    has_game: false,
    created_at: "2024-01-05",
  },
  {
    id: "f6",
    slug: "loup-agneau",
    title: "Le Loup et l'Agneau",
    teaser: "La raison du plus fort est toujours la meilleure. Un loup accuse injustement un agneau.",
    image_url: "",
    difficulty: "Difficile",
    duration: "4 min",
    moral: "La raison du plus fort est toujours la meilleure.",
    story: "La raison du plus fort est toujours la meilleure :\nNous l'allons montrer tout à l'heure.\nUn Agneau se désaltérait\nDans le courant d'une onde pure.\nUn Loup survient à jeun, qui cherchait aventure,\nEt que la faim en ces lieux attirait.\n\"Qui te rend si hardi de troubler mon breuvage ?\nDit cet animal plein de rage :\nTu seras châtié de ta témérité.\n— Sire, répond l'Agneau, que Votre Majesté\nNe se mette pas en colère ;\nMais plutôt qu'elle considère\nQue je me vas désaltérant\nDans le courant,\nPlus de vingt pas au-dessous d'Elle.\"\nSans autre forme de procès le Loup l'emporte et le mange.",
    has_game: false,
    created_at: "2024-01-06",
  },
];

const SEED_GAMES: StoredGame[] = [
  {
    id: "g1",
    fable_id: "f1",
    game_type: "true_false",
    title: "Vrai ou Faux - Le Corbeau et le Renard",
    sort_order: 0,
    game_data: {
      statements: [
        { text: "Le corbeau tenait un fromage dans son bec.", isTrue: true },
        { text: "Le renard a chanté pour le corbeau.", isTrue: false },
        { text: "Le corbeau a laissé tomber le fromage.", isTrue: true },
        { text: "Le renard a flatté le corbeau.", isTrue: true },
        { text: "Le corbeau a mangé le fromage à la fin.", isTrue: false },
      ],
    },
  },
  {
    id: "g2",
    fable_id: "f1",
    game_type: "fill_blanks",
    title: "Texte à trous - Le Corbeau",
    sort_order: 1,
    game_data: {
      paragraph: "Maître ___Corbeau___, sur un arbre perché, tenait en son bec un ___fromage___. Maître ___Renard___, par l'odeur alléché, lui tint à peu près ce ___langage___.",
      words: ["Corbeau", "fromage", "Renard", "langage"],
    },
  },
  {
    id: "g3",
    fable_id: "f2",
    game_type: "paragraph_order",
    title: "Ordre des événements - La Cigale",
    sort_order: 0,
    game_data: {
      paragraph: "La Cigale chante tout l'été. La bise arrive. La Cigale a faim. Elle va chez la Fourmi. La Fourmi refuse de l'aider.",
      sentences: [
        "La Cigale chante tout l'été.",
        "La bise arrive.",
        "La Cigale a faim.",
        "Elle va chez la Fourmi.",
        "La Fourmi refuse de l'aider.",
      ],
    },
  },
  {
    id: "g4",
    fable_id: "f2",
    game_type: "true_false",
    title: "Vrai ou Faux - La Cigale et la Fourmi",
    sort_order: 1,
    game_data: {
      statements: [
        { text: "La Cigale a travaillé tout l'été.", isTrue: false },
        { text: "La Fourmi a refusé d'aider la Cigale.", isTrue: true },
        { text: "La Cigale chantait pendant l'été.", isTrue: true },
        { text: "La Fourmi a partagé sa nourriture.", isTrue: false },
      ],
    },
  },
  {
    id: "g5",
    fable_id: "f3",
    game_type: "true_false",
    title: "Vrai ou Faux - Le Lièvre et la Tortue",
    sort_order: 0,
    game_data: {
      statements: [
        { text: "Le lièvre a gagné la course.", isTrue: false },
        { text: "La tortue avançait lentement mais sûrement.", isTrue: true },
        { text: "Le lièvre s'est arrêté pour dormir.", isTrue: true },
        { text: "La tortue a abandonné la course.", isTrue: false },
      ],
    },
  },
];

const SEED_USERS: StoredUser[] = [
  {
    id: "admin-001",
    email: "admin@gmail.com",
    password: "admin123",
    display_name: "Administrateur",
    role: "admin",
    created_at: "2024-01-01",
  },
];

// ─── Helpers ───
function get<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded() {
  if (!localStorage.getItem("latifa_seeded")) {
    set(KEYS.fables, SEED_FABLES);
    set(KEYS.games, SEED_GAMES);
    set(KEYS.users, SEED_USERS);
    set(KEYS.progress, []);
    localStorage.setItem("latifa_seeded", "true");
  }
}

// Call on import
ensureSeeded();

// ─── Fables ───
export const fableStore = {
  getAll: (): StoredFable[] => get<StoredFable>(KEYS.fables),
  getById: (id: string): StoredFable | undefined => get<StoredFable>(KEYS.fables).find((f) => f.id === id),
  add: (fable: Omit<StoredFable, "id" | "created_at">): StoredFable => {
    const all = get<StoredFable>(KEYS.fables);
    const newFable: StoredFable = { ...fable, id: genId(), created_at: new Date().toISOString() };
    all.push(newFable);
    set(KEYS.fables, all);
    return newFable;
  },
  update: (id: string, updates: Partial<StoredFable>) => {
    const all = get<StoredFable>(KEYS.fables);
    const idx = all.findIndex((f) => f.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      set(KEYS.fables, all);
    }
  },
  remove: (id: string) => {
    set(KEYS.fables, get<StoredFable>(KEYS.fables).filter((f) => f.id !== id));
    // Also remove associated games
    set(KEYS.games, get<StoredGame>(KEYS.games).filter((g) => g.fable_id !== id));
  },
};

// ─── Games ───
export const gameStore = {
  getByFable: (fableId: string): StoredGame[] =>
    get<StoredGame>(KEYS.games)
      .filter((g) => g.fable_id === fableId)
      .sort((a, b) => a.sort_order - b.sort_order),
  add: (game: Omit<StoredGame, "id">): StoredGame => {
    const all = get<StoredGame>(KEYS.games);
    const newGame: StoredGame = { ...game, id: genId() };
    all.push(newGame);
    set(KEYS.games, all);
    return newGame;
  },
  remove: (id: string) => {
    set(KEYS.games, get<StoredGame>(KEYS.games).filter((g) => g.id !== id));
  },
};

// ─── Users ───
export const userStore = {
  getAll: (): StoredUser[] => get<StoredUser>(KEYS.users),
  findByEmail: (email: string): StoredUser | undefined =>
    get<StoredUser>(KEYS.users).find((u) => u.email.toLowerCase() === email.toLowerCase()),
  register: (email: string, password: string, displayName: string): StoredUser => {
    const existing = userStore.findByEmail(email);
    if (existing) throw new Error("Un compte avec cet email existe déjà.");
    const all = get<StoredUser>(KEYS.users);
    const user: StoredUser = {
      id: genId(),
      email,
      password,
      display_name: displayName,
      role: "user",
      created_at: new Date().toISOString(),
    };
    all.push(user);
    set(KEYS.users, all);
    return user;
  },
  login: (email: string, password: string): StoredUser => {
    const user = userStore.findByEmail(email);
    if (!user || user.password !== password) throw new Error("Email ou mot de passe incorrect.");
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
    return user;
  },
  logout: () => {
    localStorage.removeItem(KEYS.currentUser);
  },
  getCurrentUser: (): StoredUser | null => {
    try {
      const raw = localStorage.getItem(KEYS.currentUser);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

// ─── Progress ───
export const progressStore = {
  get: (userId: string, fableId: string): StoredProgress | undefined =>
    get<StoredProgress>(KEYS.progress).find((p) => p.user_id === userId && p.fable_id === fableId),
  getAllForUser: (userId: string): StoredProgress[] =>
    get<StoredProgress>(KEYS.progress).filter((p) => p.user_id === userId),
  upsert: (userId: string, fableId: string, updates: Partial<StoredProgress>) => {
    const all = get<StoredProgress>(KEYS.progress);
    const idx = all.findIndex((p) => p.user_id === userId && p.fable_id === fableId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
    } else {
      all.push({
        id: genId(),
        user_id: userId,
        fable_id: fableId,
        video_watched: false,
        story_read: false,
        games_completed: [],
        completed: false,
        stars: 0,
        game_attempts: {},
        ...updates,
      });
    }
    set(KEYS.progress, all);
  },
  markGame: (userId: string, fableId: string, gameId: string) => {
    const all = get<StoredProgress>(KEYS.progress);
    const idx = all.findIndex((p) => p.user_id === userId && p.fable_id === fableId);
    if (idx !== -1) {
      const current = all[idx].games_completed || [];
      if (!current.includes(gameId)) {
        all[idx].games_completed = [...current, gameId];
      }
      // Track attempts
      const attempts = all[idx].game_attempts || {};
      attempts[gameId] = (attempts[gameId] || 0) + 1;
      all[idx].game_attempts = attempts;
    } else {
      all.push({
        id: genId(),
        user_id: userId,
        fable_id: fableId,
        video_watched: false,
        story_read: false,
        games_completed: [gameId],
        completed: false,
        stars: 0,
        game_attempts: { [gameId]: 1 },
      });
    }
    set(KEYS.progress, all);
  },
  calculateStars: (userId: string, fableId: string, totalGames: number): number => {
    const p = progressStore.get(userId, fableId);
    if (!p || !p.completed) return 0;
    const attempts = p.game_attempts || {};
    const totalAttempts = Object.values(attempts).reduce((s, n) => s + n, 0);
    const perfectGames = Object.values(attempts).filter((n) => n === 1).length;
    // 5 stars if all first try, down to 1 star
    if (totalGames === 0) return 3;
    const ratio = perfectGames / totalGames;
    if (ratio >= 1) return 5;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  },
  getTotalStars: (userId: string): number => {
    const all = get<StoredProgress>(KEYS.progress).filter((p) => p.user_id === userId && p.completed);
    return all.reduce((sum, p) => sum + (p.stars || 0), 0);
  },
  getLeaderboard: (): { userId: string; displayName: string; stars: number }[] => {
    const users = get<StoredUser>(KEYS.users).filter((u) => u.role === "user");
    const allProgress = get<StoredProgress>(KEYS.progress);
    return users
      .map((u) => ({
        userId: u.id,
        displayName: u.display_name,
        stars: allProgress.filter((p) => p.user_id === u.id && p.completed).reduce((s, p) => s + (p.stars || 0), 0),
      }))
      .sort((a, b) => b.stars - a.stars);
  },
};

function genId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
