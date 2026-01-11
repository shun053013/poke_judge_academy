'use client';

import Link from 'next/link';
import { useQuizStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/progress/StatCard';
import { CategoryProgress } from '@/components/progress/CategoryProgress';
import { StudyHistory } from '@/components/progress/StudyHistory';
import { BookOpen, Target, TrendingUp, Award } from 'lucide-react';
import { getRank } from '@/lib/utils';

export default function ProgressPage() {
  const userProgress = useQuizStore((state) => state.userProgress);

  if (!userProgress) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">進捗管理</h1>
          <p className="text-gray-600 mb-8">
            まだ学習履歴がありません。<br />
            クイズに挑戦して学習を始めましょう！
          </p>
          <Link href="/quiz">
            <Button size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              クイズを始める
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasStarted = userProgress.totalQuestionsAttempted > 0;
  const rank = getRank(userProgress.overallAccuracy);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">学習進捗</h1>
        <p className="text-gray-600 mt-2">
          あなたの学習状況を確認しましょう
        </p>
      </div>

      {hasStarted ? (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="総問題数"
              value={userProgress.totalQuestionsAttempted}
              icon={BookOpen}
              description="解いた問題"
              color="blue"
            />
            <StatCard
              title="正答率"
              value={`${userProgress.overallAccuracy.toFixed(1)}%`}
              icon={Target}
              description={`ランク ${rank}`}
              color="green"
            />
            <StatCard
              title="正解数"
              value={userProgress.totalCorrect}
              icon={TrendingUp}
              description="正しく答えた問題"
              color="purple"
            />
            <StatCard
              title="クイズ回数"
              value={userProgress.quizHistory.length}
              icon={Award}
              description="挑戦した回数"
              color="yellow"
            />
          </div>

          {/* カテゴリー別進捗 */}
          <CategoryProgress categoryStats={userProgress.categoryStats} />

          {/* 学習履歴 */}
          <StudyHistory quizHistory={userProgress.quizHistory} />

          {/* アクション */}
          <div className="text-center">
            <Link href="/quiz">
              <Button size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                クイズを続ける
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6">
          <p className="text-gray-600">
            まだクイズに挑戦していません。<br />
            さっそく始めてみましょう！
          </p>
          <Link href="/quiz">
            <Button size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              クイズを始める
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
