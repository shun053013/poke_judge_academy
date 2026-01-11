import { UserProgress, QuizSession, CategoryStats, QuestionCategory } from './types';

// localStorageのキー定義
const STORAGE_KEYS = {
  PROGRESS: 'poke-judge-progress',
  CURRENT_SESSION: 'poke-judge-current-session',
} as const;

// スキーマバージョン
const SCHEMA_VERSION = '1.1.0';

/**
 * ユーザー進捗データを読み込む
 */
export const loadUserProgress = (): UserProgress | null => {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!data) return null;

    const progress = JSON.parse(data) as UserProgress;

    // スキーマバージョンチェックとマイグレーション
    if (progress.version !== SCHEMA_VERSION) {
      console.warn('Progress data version mismatch. Migrating...');

      // v1.0.0 -> v1.1.0: incorrectQuestions フィールドを追加
      if (!progress.incorrectQuestions) {
        const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
        progress.incorrectQuestions = {} as Record<QuestionCategory, string[]>;
        categories.forEach(category => {
          progress.incorrectQuestions[category] = [];
        });
        progress.version = SCHEMA_VERSION;
        saveUserProgress(progress);
        console.log('Migrated to schema version', SCHEMA_VERSION);
      }
    }

    // incorrectQuestionsが存在しない場合は初期化（バージョンが同じでも）
    if (!progress.incorrectQuestions) {
      console.warn('incorrectQuestions field missing. Initializing...');
      const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
      progress.incorrectQuestions = {} as Record<QuestionCategory, string[]>;
      categories.forEach(category => {
        progress.incorrectQuestions[category] = [];
      });
      saveUserProgress(progress);
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

  const incorrectQuestions: Record<QuestionCategory, string[]> = {} as Record<QuestionCategory, string[]>;
  categories.forEach(category => {
    incorrectQuestions[category] = [];
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
    incorrectQuestions,
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

/**
 * 不正解問題をリストに追加する
 */
export const addIncorrectQuestion = (category: QuestionCategory, questionId: string): void => {
  const progress = loadUserProgress();
  if (!progress) return;

  // incorrectQuestionsが存在しない場合は初期化
  if (!progress.incorrectQuestions) {
    const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
    progress.incorrectQuestions = {} as Record<QuestionCategory, string[]>;
    categories.forEach(cat => {
      progress.incorrectQuestions[cat] = [];
    });
  }

  // カテゴリーが存在しない場合は初期化
  if (!progress.incorrectQuestions[category]) {
    progress.incorrectQuestions[category] = [];
  }

  // 重複チェック
  if (!progress.incorrectQuestions[category].includes(questionId)) {
    progress.incorrectQuestions[category].push(questionId);
    saveUserProgress(progress);
  }
};

/**
 * 不正解問題をリストから削除する
 */
export const removeIncorrectQuestion = (category: QuestionCategory, questionId: string): void => {
  const progress = loadUserProgress();
  if (!progress) return;

  // incorrectQuestionsが存在しない、またはカテゴリーが存在しない場合は何もしない
  if (!progress.incorrectQuestions || !progress.incorrectQuestions[category]) {
    return;
  }

  progress.incorrectQuestions[category] = progress.incorrectQuestions[category].filter(
    id => id !== questionId
  );
  saveUserProgress(progress);
};

/**
 * カテゴリー別の不正解問題数を取得する
 */
export const getIncorrectQuestionCount = (category: QuestionCategory): number => {
  const progress = loadUserProgress();
  if (!progress) return 0;

  // incorrectQuestionsが存在しない場合は0を返す
  if (!progress.incorrectQuestions) return 0;

  return progress.incorrectQuestions[category]?.length || 0;
};
