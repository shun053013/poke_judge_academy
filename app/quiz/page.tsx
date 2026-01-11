'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAllCategories, getCategoryStatistics } from '@/lib/questionLoader';
import { useQuizStore } from '@/lib/store';
import { QuestionCategory } from '@/lib/types';

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('category') as QuestionCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(
    preselectedCategory
  );
  const [questionCount, setQuestionCount] = useState<number>(10);

  const { userProgress, loadProgress } = useQuizStore();
  const categories = getAllCategories();

  // コンポーネントマウント時とページが表示されるたびにuserProgressを読み込む
  useEffect(() => {
    // 初回読み込み
    loadProgress();

    // ページが表示されるたびに読み込む
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible, reloading progress...');
        loadProgress();
      }
    };

    const handleFocus = () => {
      console.log('🔄 Window focused, reloading progress...');
      loadProgress();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProgress]);

  const handleStartQuiz = () => {
    if (!selectedCategory) {
      alert('カテゴリーを選択してください');
      return;
    }

    router.push(`/quiz/${selectedCategory}?count=${questionCount}`);
  };

  const categoryStats = selectedCategory
    ? getCategoryStatistics(selectedCategory)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">クイズ設定</h1>
        <p className="text-gray-600 mt-2">
          カテゴリーと問題数を選択してクイズを開始します
        </p>
      </div>

      {/* カテゴリー選択 */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>1. カテゴリーを選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => {
              const stats = getCategoryStatistics(category.id);
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="default" size="sm">
                          {stats.total}問
                        </Badge>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {categoryStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                カテゴリー詳細
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">初級:</span>
                  <span className="ml-2 font-medium">{categoryStats.beginner}問</span>
                </div>
                <div>
                  <span className="text-gray-600">中級:</span>
                  <span className="ml-2 font-medium">{categoryStats.intermediate}問</span>
                </div>
                <div>
                  <span className="text-gray-600">上級:</span>
                  <span className="ml-2 font-medium">{categoryStats.advanced}問</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 問題数選択 */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>2. 問題数を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max={categoryStats?.total || 50}
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-bold text-2xl text-blue-600 w-16 text-right">
                {questionCount}問
              </span>
            </div>
            {categoryStats && questionCount > categoryStats.total && (
              <p className="text-sm text-orange-600">
                ※ 選択したカテゴリーには{categoryStats.total}問しかありません。
                全ての問題が出題されます。
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 苦手な問題を復習 */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>苦手な問題を復習</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => {
              const incorrectCount = userProgress?.incorrectQuestions?.[category.id]?.length || 0;

              return (
                <div
                  key={category.id}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    苦手な問題: {incorrectCount}問
                  </p>
                  <Button
                    size="sm"
                    variant={incorrectCount > 0 ? 'default' : 'outline'}
                    disabled={incorrectCount === 0}
                    onClick={() =>
                      router.push(`/quiz/${category.id}?reviewMode=true`)
                    }
                    className="mt-2 w-full"
                  >
                    {incorrectCount > 0 ? '復習する' : '復習する問題なし'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 開始ボタン */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleStartQuiz}
          disabled={!selectedCategory}
          className="px-12"
        >
          クイズを開始
        </Button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto text-center py-8">読み込み中...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
