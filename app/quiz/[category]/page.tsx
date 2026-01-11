'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { QuizCard } from '@/components/quiz/QuizCard';
import { AnswerOptions } from '@/components/quiz/AnswerOptions';
import { QuizNavigation } from '@/components/quiz/QuizNavigation';
import { ResultsSummary } from '@/components/quiz/ResultsSummary';
import { useQuizStore } from '@/lib/store';
import { QuestionCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function QuizSessionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as QuestionCategory;
  const questionCount = Number(searchParams.get('count')) || 10;

  const {
    currentSession,
    currentQuestionIndex,
    selectedAnswer,
    showExplanation,
    questions,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    resetQuiz,
  } = useQuizStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // クイズを開始
    if (!isInitialized && category) {
      startQuiz({
        category,
        questionCount,
        shuffle: true,
      });
      setIsInitialized(true);
    }
  }, [category, questionCount, isInitialized, startQuiz]);

  // クイズが終了している場合
  if (currentSession && currentSession.endTime) {
    return (
      <ResultsSummary
        session={currentSession}
        onRetry={() => {
          resetQuiz();
          router.push('/quiz');
        }}
      />
    );
  }

  // まだ読み込み中
  if (!isInitialized || !currentSession || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">クイズを準備しています...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="text-center">
        <p className="text-red-600">問題の読み込みに失敗しました。</p>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 進捗バー */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* 問題カード */}
      <QuizCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      {/* 選択肢 */}
      <AnswerOptions
        options={currentQuestion.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={currentQuestion.correctAnswer}
        showResult={showExplanation}
        onSelect={selectAnswer}
        disabled={false}
      />

      {/* 解説（回答後に表示） */}
      {showExplanation && (
        <Card variant="bordered" className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">解説</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.reference && (
              <p className="text-sm text-gray-600 mt-3">
                参照: {currentQuestion.reference}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ナビゲーション */}
      <QuizNavigation
        showExplanation={showExplanation}
        selectedAnswer={selectedAnswer}
        isLastQuestion={isLastQuestion}
        onSubmit={submitAnswer}
        onNext={nextQuestion}
        onSkip={skipQuestion}
      />
    </div>
  );
}
