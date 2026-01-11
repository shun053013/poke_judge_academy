import { Button } from '@/components/ui/Button';
import { ChevronRight, SkipForward, Send } from 'lucide-react';

interface QuizNavigationProps {
  showExplanation: boolean;
  selectedAnswer: number | null;
  isLastQuestion: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const QuizNavigation = ({
  showExplanation,
  selectedAnswer,
  isLastQuestion,
  onSubmit,
  onNext,
  onSkip,
}: QuizNavigationProps) => {
  if (showExplanation) {
    // 解説表示中 - 次へボタンまたは完了ボタン
    return (
      <div className="flex justify-end">
        <Button size="lg" onClick={onNext}>
          {isLastQuestion ? '結果を見る' : '次の問題へ'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  // 回答選択中
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        onClick={onSkip}
      >
        <SkipForward className="w-4 h-4 mr-2" />
        スキップ
      </Button>

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={selectedAnswer === null}
      >
        <Send className="w-5 h-5 mr-2" />
        回答する
      </Button>
    </div>
  );
};
