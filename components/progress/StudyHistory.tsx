import { QuizSession } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCategoryInfo } from '@/lib/questionLoader';
import { formatDateTime, getRank, getRankColor } from '@/lib/utils';

interface StudyHistoryProps {
  quizHistory: QuizSession[];
}

export const StudyHistory = ({ quizHistory }: StudyHistoryProps) => {
  // 最新10件のみ表示
  const recentHistory = [...quizHistory]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  if (recentHistory.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-gray-600">
          学習履歴がありません。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>最近の学習履歴</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentHistory.map((session, index) => {
            const categoryInfo = getCategoryInfo(session.category);
            const rank = getRank(session.score);
            const correctCount = session.questions.filter((q) => q.isCorrect).length;
            const totalCount = session.questions.length;

            return (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {categoryInfo.name}
                    </span>
                    <Badge className={getRankColor(rank)} size="sm">
                      {rank}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(session.startTime)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {session.score.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    {correctCount}/{totalCount}問正解
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
