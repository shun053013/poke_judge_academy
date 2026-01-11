// カテゴリー型定義
export type QuestionCategory =
  | 'rules'          // 基本ルール
  | 'advanced_rules' // 上級ルール
  | 'penalties'      // ペナルティ
  | 'tournament'     // 大会運営
  | 'mechanics'      // ゲームメカニクス
  | 'scenarios';     // シナリオ問題

// 難易度型定義
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 問題データ型
export interface Question {
  id: string;                    // 一意識別子 (例: "rules-001")
  category: QuestionCategory;
  difficulty: Difficulty;
  question: string;              // 問題文
  options: string[];             // 選択肢（4つ）
  correctAnswer: number;         // 正解のインデックス（0-3）
  explanation: string;           // 解説
  tags?: string[];              // タグ（オプション）
  reference?: string;           // 参照元（オプション）
}

// 問題バンク型（JSONファイルの構造）
export interface QuestionBank {
  category: QuestionCategory;
  version: string;              // データバージョン
  lastUpdated: string;          // 最終更新日（ISO形式）
  questions: Question[];
}

// クイズの解答記録
export interface QuizAttempt {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: string;            // ISO形式
  timeSpent?: number;           // 解答にかかった時間（秒）
}

// クイズセッション
export interface QuizSession {
  sessionId: string;
  category: QuestionCategory;
  startTime: string;            // ISO形式
  endTime?: string;             // ISO形式（クイズ終了時）
  questions: QuizAttempt[];
  score: number;                // パーセンテージ（0-100）
}

// 難易度別統計
export interface DifficultyStats {
  correct: number;
  total: number;
  accuracy: number;             // パーセンテージ（0-100）
}

// カテゴリー別統計
export interface CategoryStats {
  category: QuestionCategory;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;             // パーセンテージ（0-100）
  lastStudied?: string;         // ISO形式
  difficultyBreakdown: {
    beginner: DifficultyStats;
    intermediate: DifficultyStats;
    advanced: DifficultyStats;
  };
}

// ユーザー進捗データ
export interface UserProgress {
  version: string;              // スキーマバージョン
  userId: string;               // ローカル識別用UUID
  createdAt: string;            // ISO形式
  lastActive: string;           // ISO形式
  totalQuestionsAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;      // パーセンテージ（0-100）
  categoryStats: Record<QuestionCategory, CategoryStats>;
  quizHistory: QuizSession[];
  bookmarkedQuestions: string[]; // 問題IDの配列
  incorrectQuestions: Record<QuestionCategory, string[]>; // カテゴリー別の不正解問題ID
}

// カテゴリー情報（UI表示用）
export interface CategoryInfo {
  id: QuestionCategory;
  name: string;
  description: string;
  icon: string;                 // Lucide-reactのアイコン名
  color: string;                // Tailwindのカラークラス
}

// クイズ設定（クイズ開始時の設定）
export interface QuizConfig {
  category: QuestionCategory;
  difficulty?: Difficulty;      // 指定しない場合は全難易度
  questionCount: number;        // 出題数
  shuffle: boolean;             // 問題をシャッフルするか
  reviewMode?: boolean;         // 復習モード（不正解問題のみ出題）
}
