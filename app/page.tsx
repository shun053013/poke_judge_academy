'use client';

import Link from 'next/link';
import { BookOpen, Trophy, AlertTriangle, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQuizStore } from '@/lib/store';
import { getAllCategories, getQuestionCount } from '@/lib/questionLoader';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Trophy,
  AlertTriangle,
  Zap,
  MessageSquare,
};

export default function Home() {
  const userProgress = useQuizStore((state) => state.userProgress);
  const categories = getAllCategories();

  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          ポケカジャッジ道場へようこそ
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ポケモンカードゲームのジャッジ資格取得を目指して、クイズ形式で楽しく学習しましょう！
        </p>
      </section>

      {/* 統計サマリー */}
      {userProgress && userProgress.totalQuestionsAttempted > 0 && (
        <section>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>あなたの学習状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {userProgress.totalQuestionsAttempted}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">総問題数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userProgress.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">正答率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {userProgress.quizHistory.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">クイズ回数</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link href="/progress">
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    詳細な進捗を見る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* カテゴリー一覧 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">カテゴリーから選ぶ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            const questionCount = getQuestionCount(category.id);
            const categoryStats = userProgress?.categoryStats[category.id];

            return (
              <Link key={category.id} href={`/quiz?category=${category.id}`}>
                <Card
                  variant="bordered"
                  className="hover:shadow-md transition-shadow cursor-pointer h-full"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                        {Icon && <Icon className={`w-6 h-6 text-${category.color}-600`} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="default" size="sm">
                            {questionCount}問
                          </Badge>
                          {categoryStats && categoryStats.totalAttempts > 0 && (
                            <span className="text-sm font-medium text-gray-700">
                              正答率: {categoryStats.accuracy.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* クイックアクション */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">さっそく始めましょう</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <Button size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              クイズを始める
            </Button>
          </Link>
          <Link href="/progress">
            <Button size="lg" variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              進捗を確認する
            </Button>
          </Link>
        </div>
      </section>

      {/* 使い方ガイド */}
      <section>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>使い方</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>上のカテゴリーから学習したい分野を選択します</li>
              <li>クイズが開始されたら、4つの選択肢から正解を選びます</li>
              <li>回答後、正解・不正解と解説が表示されます</li>
              <li>全ての問題に回答すると、結果が表示されます</li>
              <li>進捗ページで学習履歴や正答率を確認できます</li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
