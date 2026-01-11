import { Card } from '@/components/ui/Card';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  correctAnswer?: number;
  showResult: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export const AnswerOptions = ({
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onSelect,
  disabled = false,
}: AnswerOptionsProps) => {
  const getOptionStyle = (index: number) => {
    if (!showResult) {
      // 回答前または回答選択中
      if (selectedAnswer === index) {
        return 'border-blue-500 bg-blue-50';
      }
      return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }

    // 回答後
    if (index === correctAnswer) {
      return 'border-green-500 bg-green-50';
    }
    if (index === selectedAnswer && index !== correctAnswer) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  const getOptionIcon = (index: number) => {
    if (!showResult) return null;

    if (index === correctAnswer) {
      return <Check className="w-6 h-6 text-green-600" />;
    }
    if (index === selectedAnswer && index !== correctAnswer) {
      return <X className="w-6 h-6 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const optionLabel = ['A', 'B', 'C', 'D'][index];
        const icon = getOptionIcon(index);

        return (
          <button
            key={index}
            onClick={() => !disabled && !showResult && onSelect(index)}
            disabled={disabled || showResult}
            className={cn(
              'w-full p-4 rounded-lg border-2 transition-all text-left',
              'flex items-start space-x-3',
              getOptionStyle(index),
              !disabled && !showResult && 'cursor-pointer',
              (disabled || showResult) && 'cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold',
                selectedAnswer === index && !showResult && 'bg-blue-600 text-white',
                selectedAnswer !== index && !showResult && 'bg-gray-200 text-gray-700',
                showResult && index === correctAnswer && 'bg-green-600 text-white',
                showResult && index === selectedAnswer && index !== correctAnswer && 'bg-red-600 text-white',
                showResult && index !== selectedAnswer && index !== correctAnswer && 'bg-gray-200 text-gray-500'
              )}
            >
              {optionLabel}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-900 leading-relaxed">{option}</p>
            </div>
            {icon && <div className="flex-shrink-0">{icon}</div>}
          </button>
        );
      })}
    </div>
  );
};
