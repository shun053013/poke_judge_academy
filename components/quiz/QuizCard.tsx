import { Question } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizCard = ({ question, questionNumber, totalQuestions }: QuizCardProps) => {
  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        {/* ヘッダー情報 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            問題 {questionNumber} / {totalQuestions}
          </span>
          <Badge
            className={getDifficultyColor(question.difficulty)}
            size="sm"
          >
            {getDifficultyLabel(question.difficulty)}
          </Badge>
        </div>

        {/* 問題文 */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* タグ（あれば表示） */}
        {question.tags && question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <Badge key={index} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
