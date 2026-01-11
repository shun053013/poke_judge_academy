import { UserProgress, QuizSession, CategoryStats, QuestionCategory } from './types';

// localStorageのキー定義
const STORAGE_KEYS = {
  PROGRESS: 'poke-judge-progress',
  CURRENT_SESSION: 'poke-judge-current-session',
} as const;

// スキーマバージョン
const SCHEMA_VERSION = '1.0.0';

/**
 * ユーザー進捗データを読み込む
 */
export const loadUserProgress = (): UserProgress | null => {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!data) return null;

    const progress = JSON.parse(data) as UserProgress;

    // スキーマバージョンチェック（将来のマイグレーション用）
    if (progress.version !== SCHEMA_VERSION) {
      console.warn('Progress data version mismatch. Migration may be needed.');
      // TODO: スキーママイグレーション処理
    }

    return progress;
  } catch (error) {
    console.error('Failed to load user progress:', error);
    return null;
  }
};

/**
 * ユーザー進捗データを保存する
 */
export const saveUserProgress = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;

  try {
    // 最終アクティブ日時を更新
    progress.lastActive = new Date().toISOString();

    const data = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, data);
  } catch (error) {
    console.error('Failed to save user progress:', error);
    // localStorage容量エラーの場合、古いセッションを削除
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      pruneOldSessions(progress);
      // 再試行
      try {
        const data = JSON.stringify(progress);
        localStorage.setItem(STORAGE_KEYS.PROGRESS, data);
      } catch (retryError) {
        console.error('Failed to save even after pruning:', retryError);
      }
    }
  }
};

/**
 * 現在のクイズセッションを保存する（復元用）
 */
export const saveCurrentSession = (session: QuizSession): void => {
  if (typeof window === 'undefined') return;

  try {
    const data = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, data);
  } catch (error) {
    console.error('Failed to save current session:', error);
  }
};

/**
 * 現在のクイズセッションを読み込む
 */
export const loadCurrentSession = (): QuizSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!data) return null;

    return JSON.parse(data) as QuizSession;
  } catch (error) {
    console.error('Failed to load current session:', error);
    return null;
  }
};

/**
 * 現在のクイズセッションをクリアする
 */
export const clearCurrentSession = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Failed to clear current session:', error);
  }
};

/**
 * 初期のユーザー進捗データを作成する
 */
export const initializeProgress = (): UserProgress => {
  const userId = generateUUID();
  const now = new Date().toISOString();

  const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
  const categoryStats: Record<QuestionCategory, CategoryStats> = {} as Record<QuestionCategory, CategoryStats>;

  categories.forEach(category => {
    categoryStats[category] = {
      category,
      totalAttempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      difficultyBreakdown: {
        beginner: { correct: 0, total: 0, accuracy: 0 },
        intermediate: { correct: 0, total: 0, accuracy: 0 },
        advanced: { correct: 0, total: 0, accuracy: 0 },
      },
    };
  });

  return {
    version: SCHEMA_VERSION,
    userId,
    createdAt: now,
    lastActive: now,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    overallAccuracy: 0,
    categoryStats,
    quizHistory: [],
    bookmarkedQuestions: [],
  };
};

/**
 * カテゴリー別統計を計算する
 */
export const calculateCategoryStats = (
  history: QuizSession[],
  category: QuestionCategory
): CategoryStats => {
  const categoryHistory = history.filter(session => session.category === category);

  if (categoryHistory.length === 0) {
    return {
      category,
      totalAttempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      difficultyBreakdown: {
        beginner: { correct: 0, total: 0, accuracy: 0 },
        intermediate: { correct: 0, total: 0, accuracy: 0 },
        advanced: { correct: 0, total: 0, accuracy: 0 },
      },
    };
  }

  let totalAttempts = 0;
  let correctAnswers = 0;
  let lastStudied: string | undefined;

  const difficultyBreakdown = {
    beginner: { correct: 0, total: 0, accuracy: 0 },
    intermediate: { correct: 0, total: 0, accuracy: 0 },
    advanced: { correct: 0, total: 0, accuracy: 0 },
  };

  categoryHistory.forEach(session => {
    session.questions.forEach(attempt => {
      totalAttempts++;
      if (attempt.isCorrect) correctAnswers++;
    });

    if (!lastStudied || session.startTime > lastStudied) {
      lastStudied = session.startTime;
    }
  });

  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

  // 難易度別の計算（実際の問題データと照合が必要）
  // ここでは簡略化のため、空のままにする
  // 実際の使用時は問題データと照合して計算する

  return {
    category,
    totalAttempts,
    correctAnswers,
    accuracy: Math.round(accuracy * 10) / 10,
    lastStudied,
    difficultyBreakdown,
  };
};

/**
 * 古いクイズセッションを削除する（最新100件のみ保持）
 */
const pruneOldSessions = (progress: UserProgress): void => {
  const MAX_SESSIONS = 100;

  if (progress.quizHistory.length > MAX_SESSIONS) {
    // 日時でソートして新しいものから100件のみ保持
    progress.quizHistory.sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    progress.quizHistory = progress.quizHistory.slice(0, MAX_SESSIONS);
  }
};

/**
 * UUIDを生成する（簡易版）
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * ユーザー進捗を完全にリセットする
 */
export const resetProgress = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Failed to reset progress:', error);
  }
};

/**
 * localStorage の使用容量を取得する（KB単位）
 */
export const getStorageSize = (): number => {
  if (typeof window === 'undefined') return 0;

  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return Math.round(total / 1024 * 10) / 10; // KB単位、小数点1桁
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return 0;
  }
};
