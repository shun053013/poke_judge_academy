import { Question, QuestionCategory, QuestionBank, Difficulty, QuizConfig } from './types';

// 問題データのインポート
import rulesData from '@/data/questions/rules.json';
import advancedRulesData from '@/data/questions/advanced_rules.json';
import penaltiesData from '@/data/questions/penalties.json';
import tournamentData from '@/data/questions/tournament.json';
import mechanicsData from '@/data/questions/mechanics.json';
import scenariosData from '@/data/questions/scenarios.json';

// 問題バンクのマップ
const questionBanks: Record<QuestionCategory, QuestionBank> = {
  rules: rulesData as QuestionBank,
  advanced_rules: advancedRulesData as QuestionBank,
  penalties: penaltiesData as QuestionBank,
  tournament: tournamentData as QuestionBank,
  mechanics: mechanicsData as QuestionBank,
  scenarios: scenariosData as QuestionBank,
};

/**
 * カテゴリー別に問題を取得する
 */
export const getQuestionsByCategory = (category: QuestionCategory): Question[] => {
  const bank = questionBanks[category];
  if (!bank || !bank.questions) {
    console.error(`No questions found for category: ${category}`);
    return [];
  }
  return bank.questions;
};

/**
 * 全ての問題を取得する
 */
export const getAllQuestions = (): Question[] => {
  return Object.values(questionBanks).flatMap(bank => bank.questions || []);
};

/**
 * カテゴリーとオプションに基づいて問題を取得する
 */
export const getQuestions = (config: QuizConfig): Question[] => {
  let questions = getQuestionsByCategory(config.category);

  // 難易度フィルタリング
  if (config.difficulty) {
    questions = questions.filter(q => q.difficulty === config.difficulty);
  }

  // シャッフル
  if (config.shuffle) {
    questions = shuffleArray([...questions]);
  }

  // 指定された数だけ取得
  return questions.slice(0, config.questionCount);
};

/**
 * ランダムに問題を取得する
 */
export const getRandomQuestions = (
  category: QuestionCategory,
  count: number
): Question[] => {
  const questions = getQuestionsByCategory(category);
  const shuffled = shuffleArray([...questions]);
  return shuffled.slice(0, count);
};

/**
 * 難易度別に問題を取得する
 */
export const getQuestionsByDifficulty = (
  category: QuestionCategory,
  difficulty: Difficulty
): Question[] => {
  const questions = getQuestionsByCategory(category);
  return questions.filter(q => q.difficulty === difficulty);
};

/**
 * IDで問題を取得する
 */
export const getQuestionById = (questionId: string): Question | null => {
  const allQuestions = getAllQuestions();
  return allQuestions.find(q => q.id === questionId) || null;
};

/**
 * タグで問題を検索する
 */
export const getQuestionsByTag = (tag: string): Question[] => {
  const allQuestions = getAllQuestions();
  return allQuestions.filter(q => q.tags && q.tags.includes(tag));
};

/**
 * カテゴリーの問題数を取得する
 */
export const getQuestionCount = (category: QuestionCategory): number => {
  return getQuestionsByCategory(category).length;
};

/**
 * 全カテゴリーの問題数を取得する
 */
export const getTotalQuestionCount = (): number => {
  return getAllQuestions().length;
};

/**
 * カテゴリー別の統計を取得する
 */
export const getCategoryStatistics = (category: QuestionCategory) => {
  const questions = getQuestionsByCategory(category);

  const beginnerCount = questions.filter(q => q.difficulty === 'beginner').length;
  const intermediateCount = questions.filter(q => q.difficulty === 'intermediate').length;
  const advancedCount = questions.filter(q => q.difficulty === 'advanced').length;

  return {
    total: questions.length,
    beginner: beginnerCount,
    intermediate: intermediateCount,
    advanced: advancedCount,
  };
};

/**
 * 配列をシャッフルする（Fisher-Yatesアルゴリズム）
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * カテゴリー情報を取得する（UI表示用）
 */
export const getCategoryInfo = (category: QuestionCategory) => {
  const categoryInfoMap = {
    rules: {
      id: 'rules' as QuestionCategory,
      name: '基本ルール',
      description: 'ゲームの基本ルール、ターン構造、勝利条件など',
      icon: 'BookOpen',
      color: 'blue',
    },
    advanced_rules: {
      id: 'advanced_rules' as QuestionCategory,
      name: '上級ルール',
      description: '詳細な処理手順、タイミング、効果の適用順序など',
      icon: 'GraduationCap',
      color: 'indigo',
    },
    penalties: {
      id: 'penalties' as QuestionCategory,
      name: 'ペナルティ',
      description: '警告、ゲームロス、失格の基準と対応',
      icon: 'AlertTriangle',
      color: 'red',
    },
    tournament: {
      id: 'tournament' as QuestionCategory,
      name: '大会運営',
      description: 'スイスドロー、ラウンド管理、デッキリストなど',
      icon: 'Trophy',
      color: 'yellow',
    },
    mechanics: {
      id: 'mechanics' as QuestionCategory,
      name: 'ゲームメカニクス',
      description: 'カード効果の処理、タイミング、優先順位など',
      icon: 'Zap',
      color: 'purple',
    },
    scenarios: {
      id: 'scenarios' as QuestionCategory,
      name: 'シナリオ問題',
      description: '複雑な状況での裁定、実践的なジャッジング',
      icon: 'MessageSquare',
      color: 'green',
    },
  };

  return categoryInfoMap[category];
};

/**
 * 全カテゴリーの情報を取得する
 */
export const getAllCategories = () => {
  const categories: QuestionCategory[] = ['rules', 'advanced_rules', 'penalties', 'tournament', 'mechanics', 'scenarios'];
  return categories.map(cat => getCategoryInfo(cat));
};
