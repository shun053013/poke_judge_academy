import { create } from 'zustand';
import { Question, QuizSession, UserProgress, QuizAttempt, QuestionCategory, QuizConfig } from './types';
import {
  loadUserProgress,
  saveUserProgress,
  initializeProgress,
  loadCurrentSession,
  saveCurrentSession,
  clearCurrentSession,
  calculateCategoryStats,
  addIncorrectQuestion,
  removeIncorrectQuestion,
  getIncorrectQuestionCount,
} from './localStorage';
import { getQuestions } from './questionLoader';

interface QuizState {
  // 現在のクイズセッション状態
  currentSession: QuizSession | null;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showExplanation: boolean;
  isReviewMode: boolean;

  // 問題リスト
  questions: Question[];

  // ユーザー進捗
  userProgress: UserProgress | null;

  // 読み込み状態
  isLoading: boolean;

  // アクション
  initializeStore: () => void;
  startQuiz: (config: QuizConfig) => void;
  selectAnswer: (answerIndex: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  finishQuiz: () => void;
  loadProgress: () => void;
  saveProgress: () => void;
  updateProgress: (session: QuizSession) => void;
  resetQuiz: () => void;
  getIncorrectCount: (category: QuestionCategory) => number;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // 初期状態
  currentSession: null,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  showExplanation: false,
  isReviewMode: false,
  questions: [],
  userProgress: null,
  isLoading: false,

  // ストアを初期化（アプリ起動時に呼び出す）
  initializeStore: () => {
    const progress = loadUserProgress();
    const currentSession = loadCurrentSession();

    if (!progress) {
      // 初めての場合、新規進捗データを作成
      const newProgress = initializeProgress();
      saveUserProgress(newProgress);
      set({ userProgress: newProgress });
    } else {
      set({ userProgress: progress });
    }

    // 未完了のセッションがあれば復元
    if (currentSession) {
      set({
        currentSession,
        // TODO: 問題リストの復元が必要
      });
    }
  },

  // クイズを開始
  startQuiz: (config: QuizConfig) => {
    const questions = getQuestions(config);

    if (questions.length === 0) {
      console.error('No questions available for the given config');
      return;
    }

    const sessionId = generateSessionId();
    const now = new Date().toISOString();

    const newSession: QuizSession = {
      sessionId,
      category: config.category,
      startTime: now,
      questions: [],
      score: 0,
    };

    set({
      currentSession: newSession,
      questions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showExplanation: false,
      isReviewMode: config.reviewMode || false,
    });

    // セッションを保存（復元用）
    saveCurrentSession(newSession);
  },

  // 回答を選択
  selectAnswer: (answerIndex: number) => {
    set({ selectedAnswer: answerIndex });
  },

  // 回答を送信
  submitAnswer: () => {
    const { currentSession, questions, currentQuestionIndex, selectedAnswer, isReviewMode } = get();

    if (!currentSession || selectedAnswer === null) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
    };

    // 不正解問題リストの管理
    if (!isCorrect && !isReviewMode) {
      // 通常モードで不正解の場合、リストに追加
      addIncorrectQuestion(currentSession.category, currentQuestion.id);
    } else if (isCorrect && isReviewMode) {
      // 復習モードで正解の場合、リストから削除
      removeIncorrectQuestion(currentSession.category, currentQuestion.id);
    }

    // セッションに記録
    const updatedSession = {
      ...currentSession,
      questions: [...currentSession.questions, attempt],
    };

    set({
      currentSession: updatedSession,
      showExplanation: true,
    });

    // セッションを保存
    saveCurrentSession(updatedSession);
  },

  // 次の問題へ
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();

    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedAnswer: null,
        showExplanation: false,
      });
    } else {
      // 最後の問題なのでクイズを終了
      get().finishQuiz();
    }
  },

  // 問題をスキップ
  skipQuestion: () => {
    const { currentSession, questions, currentQuestionIndex, isReviewMode } = get();

    if (!currentSession) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // スキップを記録（不正解として扱う）
    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer: -1, // -1はスキップを示す
      isCorrect: false,
      timestamp: new Date().toISOString(),
    };

    // 通常モードではスキップした問題も不正解リストに追加
    if (!isReviewMode) {
      addIncorrectQuestion(currentSession.category, currentQuestion.id);
    }

    const updatedSession = {
      ...currentSession,
      questions: [...currentSession.questions, attempt],
    };

    set({
      currentSession: updatedSession,
    });

    saveCurrentSession(updatedSession);

    // 次の問題へ
    get().nextQuestion();
  },

  // クイズを終了
  finishQuiz: () => {
    const { currentSession } = get();

    if (!currentSession) return;

    // スコアを計算
    const correctCount = currentSession.questions.filter(q => q.isCorrect).length;
    const totalCount = currentSession.questions.length;
    const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    const finishedSession: QuizSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      score: Math.round(score * 10) / 10,
    };

    set({ currentSession: finishedSession });

    // 進捗を更新
    get().updateProgress(finishedSession);

    // 現在のセッションをクリア
    clearCurrentSession();
  },

  // 進捗を読み込む
  loadProgress: () => {
    const progress = loadUserProgress();
    set({ userProgress: progress });
  },

  // 進捗を保存
  saveProgress: () => {
    const { userProgress } = get();
    if (userProgress) {
      saveUserProgress(userProgress);
    }
  },

  // 進捗を更新（クイズ終了時）
  updateProgress: (session: QuizSession) => {
    const { userProgress } = get();

    if (!userProgress) return;

    // セッションを履歴に追加
    const updatedHistory = [...userProgress.quizHistory, session];

    // 全体統計を再計算
    const allAttempts = updatedHistory.flatMap(s => s.questions);
    const totalQuestionsAttempted = allAttempts.length;
    const totalCorrect = allAttempts.filter(a => a.isCorrect).length;
    const overallAccuracy = totalQuestionsAttempted > 0
      ? (totalCorrect / totalQuestionsAttempted) * 100
      : 0;

    // カテゴリー別統計を再計算
    const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
    const updatedCategoryStats = { ...userProgress.categoryStats };

    categories.forEach(category => {
      updatedCategoryStats[category] = calculateCategoryStats(updatedHistory, category);
    });

    const updatedProgress: UserProgress = {
      ...userProgress,
      totalQuestionsAttempted,
      totalCorrect,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      categoryStats: updatedCategoryStats,
      quizHistory: updatedHistory,
    };

    set({ userProgress: updatedProgress });
    saveUserProgress(updatedProgress);
  },

  // クイズをリセット（新しいクイズを開始する前に呼び出す）
  resetQuiz: () => {
    set({
      currentSession: null,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showExplanation: false,
      isReviewMode: false,
      questions: [],
    });
    clearCurrentSession();
  },

  // カテゴリー別の不正解問題数を取得
  getIncorrectCount: (category: QuestionCategory) => {
    return getIncorrectQuestionCount(category);
  },
}));

/**
 * セッションIDを生成する
 */
const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
