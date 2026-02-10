
import React, { useState, useEffect } from 'react';
import { QUIZ_DATA } from '../constants';
import { getSpiritualInsight } from '../services/geminiService';
import { QuizQuestion } from '../types';

interface UserAnswer {
  questionId: number;
  selectedIdx: number;
  isCorrect: boolean;
}

const Quiz: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === QUIZ_DATA[currentStep].correctAnswer;
    setIsAnswerChecked(true);
    
    setUserAnswers(prev => [
      ...prev,
      {
        questionId: QUIZ_DATA[currentStep].id,
        selectedIdx: selectedAnswer,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentStep < QUIZ_DATA.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  const score = userAnswers.filter(a => a.isCorrect).length;

  useEffect(() => {
    if (isFinished) {
      setLoadingInsight(true);
      getSpiritualInsight("선한 목자의 마음", score).then(res => {
        setInsight(res || "수고하셨습니다.");
        setLoadingInsight(false);
      });
    }
  }, [isFinished, score]);

  if (isFinished) {
    const grade = score >= 9 ? "신실한 목자" : score >= 7 ? "성장하는 목자" : "사모하는 교육생";
    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

    return (
      <div className="p-8 text-center animate-in zoom-in-95 duration-700 pb-24 min-h-full flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-200 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl shadow-yellow-100 animate-bounce-slow">🏆</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">학습 리포트</h2>
        <div className="inline-block bg-indigo-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full mb-8 shadow-lg shadow-indigo-100 uppercase tracking-widest">
          {grade} 등급
        </div>
        
        <div className="grid grid-cols-2 gap-5 w-full mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100/50 border border-slate-50 flex flex-col items-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">정답 개수</p>
            <p className="text-3xl font-black text-indigo-600">{score} <span className="text-sm text-slate-300">/ {QUIZ_DATA.length}</span></p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100/50 border border-slate-50 flex flex-col items-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">정답률</p>
            <p className="text-3xl font-black text-slate-800">{(score / QUIZ_DATA.length * 100).toFixed(0)}<span className="text-sm text-slate-300">%</span></p>
          </div>
        </div>

        <div className="w-full bg-indigo-900 p-8 rounded-[3rem] text-left border border-white/20 shadow-2xl mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-white/10 text-7xl group-hover:rotate-12 transition-transform duration-700">🕊️</div>
          <h3 className="font-black text-indigo-300 text-xs tracking-[0.2em] mb-4 uppercase flex items-center gap-2 relative z-10">
            <span className="w-4 h-0.5 bg-indigo-500"></span> Spiritual Insight
          </h3>
          {loadingInsight ? (
            <div className="space-y-3 animate-pulse relative z-10">
              <div className="h-3 bg-white/20 rounded-full w-3/4"></div>
              <div className="h-3 bg-white/20 rounded-full w-5/6"></div>
              <div className="h-3 bg-white/20 rounded-full w-2/3"></div>
            </div>
          ) : (
            <p className="text-white text-base leading-relaxed font-medium relative z-10 serif italic opacity-95">
              "{insight}"
            </p>
          )}
        </div>

        {wrongAnswers.length > 0 && (
          <div className="text-left w-full mb-10">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3 ml-2">
              <span className="w-8 h-8 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center text-sm">!</span>
              오답 복습 가이드
            </h4>
            <div className="space-y-5">
              {wrongAnswers.map(wa => {
                const question = QUIZ_DATA.find(q => q.id === wa.questionId)!;
                return (
                  <div key={wa.questionId} className="bg-white border border-slate-100 p-7 rounded-[2.5rem] shadow-sm">
                    <p className="text-sm font-bold text-slate-800 mb-4 leading-snug">{question.question}</p>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                        <span className="text-[9px] font-black text-rose-500 uppercase">My Choice:</span>
                        <span className="text-xs font-bold text-rose-700">{question.options[wa.selectedIdx]}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <span className="text-[9px] font-black text-emerald-500 uppercase">Correct Answer:</span>
                        <span className="text-xs font-bold text-emerald-700">{question.options[question.correctAnswer]}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl font-medium border border-slate-50">{question.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all mb-10"
        >
          처음부터 다시 학습하기
        </button>
      </div>
    );
  }

  const q = QUIZ_DATA[currentStep];
  const isCorrect = selectedAnswer === q.correctAnswer;

  return (
    <div className="p-8 pb-24 animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <span className="text-indigo-600 font-black text-[11px] tracking-widest uppercase bg-indigo-50 px-3 py-1 rounded-full">Step {currentStep + 1}</span>
          <span className="text-slate-400 text-[11px] font-black">{currentStep + 1} / {QUIZ_DATA.length} 문항</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700 ease-out shadow-sm" 
            style={{ width: `${((currentStep + 1) / QUIZ_DATA.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 leading-snug mb-3 tracking-tight">{q.question}</h2>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-tighter">
          <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
          가장 적절한 보기를 선택하세요
        </div>
      </div>

      <div className="space-y-4">
        {q.options.map((opt, idx) => {
          let btnClass = "border-slate-100 text-slate-700 bg-white shadow-sm";
          let icon = null;

          if (isAnswerChecked) {
            if (idx === q.correctAnswer) {
              btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-black scale-[1.02] shadow-xl shadow-emerald-50";
              icon = "✓";
            } else if (idx === selectedAnswer) {
              btnClass = "border-rose-300 bg-rose-50 text-rose-700 font-bold opacity-80";
              icon = "✕";
            } else {
              btnClass = "border-slate-50 text-slate-300 bg-white opacity-40 grayscale";
            }
          } else if (selectedAnswer === idx) {
            btnClass = "border-indigo-600 bg-indigo-50 text-indigo-700 font-black scale-[1.02] shadow-xl shadow-indigo-50";
          }

          return (
            <button
              key={idx}
              disabled={isAnswerChecked}
              onClick={() => setSelectedAnswer(idx)}
              className={`w-full p-5 text-left rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group ${btnClass}`}
            >
              <span className="text-[15px] leading-tight pr-4">{opt}</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all ${isAnswerChecked && idx === q.correctAnswer ? 'bg-emerald-500 text-white' : isAnswerChecked && idx === selectedAnswer ? 'bg-rose-500 text-white' : selectedAnswer === idx ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                {icon || (idx + 1)}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswerChecked && (
        <div className="mt-8 p-7 bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></div>
            <h4 className={`text-xs font-black tracking-widest uppercase ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? 'Excellent Result' : 'Growth Opportunity'}
            </h4>
          </div>
          <p className="text-sm text-indigo-50/80 leading-relaxed font-medium">
            {q.explanation}
          </p>
        </div>
      )}

      {!isAnswerChecked ? (
        <button
          disabled={selectedAnswer === null}
          onClick={handleCheckAnswer}
          className={`mt-12 w-full py-5 rounded-[2rem] font-black transition-all shadow-2xl ${
            selectedAnswer === null 
              ? 'bg-slate-100 text-slate-300' 
              : 'bg-indigo-600 text-white active:scale-95 shadow-indigo-200'
          }`}
        >
          정답 제출하기
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="mt-12 w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
        >
          {currentStep === QUIZ_DATA.length - 1 ? '최종 결과 리포트' : '다음 단계로'}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      )}
    </div>
  );
};

export default Quiz;
