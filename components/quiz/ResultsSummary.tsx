import Link from 'next/link';
import { QuizSession } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Home, RotateCcw, BarChart3 } from 'lucide-react';
import { getRank, getRankColor } from '@/lib/utils';

interface ResultsSummaryProps {
  session: QuizSession;
  onRetry: () => void;
}

export const ResultsSummary = ({ session, onRetry }: ResultsSummaryProps) => {
  const totalQuestions = session.questions.length;
  const correctCount = session.questions.filter((q) => q.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const score = session.score;
  const rank = getRank(score);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* スコア表示 */}
      <Card variant="elevated">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
            <Trophy className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">クイズ完了！</h2>
          <div className="text-6xl font-bold text-blue-600 my-4">{score.toFixed(1)}%</div>
          <Badge className={getRankColor(rank)} size="lg">
            ランク {rank}
          </Badge>
        </CardContent>
      </Card>

      {/* 詳細統計 */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>結果詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600 mt-1">総問題数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-gray-600 mt-1">正解</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-sm text-gray-600 mt-1">不正解</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メッセージ */}
      <Card variant="bordered">
        <CardContent className="p-6">
          {score >= 80 ? (
            <p className="text-center text-gray-700">
              素晴らしい！この調子で学習を続けましょう。
            </p>
          ) : score >= 60 ? (
            <p className="text-center text-gray-700">
              良い成績です！もう少し復習すれば完璧です。
            </p>
          ) : (
            <p className="text-center text-gray-700">
              まだまだ伸びしろがあります。復習して再挑戦しましょう！
            </p>
          )}
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" fullWidth>
            <Home className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </Link>
        <Button variant="primary" onClick={onRetry} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          もう一度挑戦
        </Button>
        <Link href="/progress" className="flex-1">
          <Button variant="outline" fullWidth>
            <BarChart3 className="w-4 h-4 mr-2" />
            進捗を見る
          </Button>
        </Link>
      </div>
    </div>
  );
};
