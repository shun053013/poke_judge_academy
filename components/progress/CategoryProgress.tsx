import { CategoryStats } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCategoryInfo } from '@/lib/questionLoader';
import { getAccuracyColor } from '@/lib/utils';

interface CategoryProgressProps {
  categoryStats: Record<string, CategoryStats>;
}

export const CategoryProgress = ({ categoryStats }: CategoryProgressProps) => {
  const categories = Object.values(categoryStats).filter(
    (stat) => stat.totalAttempts > 0
  );

  if (categories.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-gray-600">
          まだクイズに挑戦していません。<br />
          まずはクイズを始めてみましょう！
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>カテゴリー別進捗</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((stat) => {
            const categoryInfo = getCategoryInfo(stat.category);
            const accuracy = stat.accuracy;

            return (
              <div key={stat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {categoryInfo.name}
                    </span>
                    <Badge variant="default" size="sm">
                      {stat.totalAttempts}問
                    </Badge>
                  </div>
                  <span className={`font-bold text-lg ${getAccuracyColor(accuracy)}`}>
                    {accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      accuracy >= 80
                        ? 'bg-green-500'
                        : accuracy >= 60
                        ? 'bg-blue-500'
                        : accuracy >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>正解: {stat.correctAnswers}問</span>
                  <span>不正解: {stat.totalAttempts - stat.correctAnswers}問</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
