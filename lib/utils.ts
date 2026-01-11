import { clsx, type ClassValue } from 'clsx';

/**
 * クラス名を結合するユーティリティ関数
 * Tailwind CSSのクラスを条件付きで適用する際に便利
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 日付を読みやすい形式にフォーマットする
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 日時を読みやすい形式にフォーマットする
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * 相対時間を取得する（例：「2日前」）
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 7) {
    return formatDate(isoString);
  } else if (diffDay > 0) {
    return `${diffDay}日前`;
  } else if (diffHour > 0) {
    return `${diffHour}時間前`;
  } else if (diffMin > 0) {
    return `${diffMin}分前`;
  } else {
    return 'たった今';
  }
}

/**
 * パーセンテージを色に変換する（正答率表示用）
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'text-green-600';
  if (accuracy >= 60) return 'text-blue-600';
  if (accuracy >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * パーセンテージを背景色に変換する（正答率表示用）
 */
export function getAccuracyBgColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-100';
  if (accuracy >= 60) return 'bg-blue-100';
  if (accuracy >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * 難易度を日本語に変換する
 */
export function getDifficultyLabel(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const labels = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
  };
  return labels[difficulty];
}

/**
 * 難易度に応じた色を取得する
 */
export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };
  return colors[difficulty];
}

/**
 * 数値を小数点以下1桁にフォーマットする
 */
export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}

/**
 * スコアからランクを取得する
 */
export function getRank(accuracy: number): string {
  if (accuracy >= 95) return 'S';
  if (accuracy >= 85) return 'A';
  if (accuracy >= 75) return 'B';
  if (accuracy >= 65) return 'C';
  if (accuracy >= 50) return 'D';
  return 'E';
}

/**
 * ランクに応じた色を取得する
 */
export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    S: 'text-purple-600 bg-purple-100',
    A: 'text-blue-600 bg-blue-100',
    B: 'text-green-600 bg-green-100',
    C: 'text-yellow-600 bg-yellow-100',
    D: 'text-orange-600 bg-orange-100',
    E: 'text-red-600 bg-red-100',
  };
  return colors[rank] || '';
}
