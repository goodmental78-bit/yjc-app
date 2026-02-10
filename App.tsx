
import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import Quiz from './components/Quiz';
import { ViewState, Lesson } from './types';
import { LESSONS, CURRENT_LESSON, PODCASTS, PodcastEpisode } from './constants';
import { GoogleGenAI, Modality } from "@google/genai";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [playingPodId, setPlayingPodId] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedPod, setSelectedPod] = useState<PodcastEpisode | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(LESSONS[0].id);
  const audioContextRef = useRef<AudioContext | null>(null);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handlePlayPodcast = async (pod: PodcastEpisode) => {
    if (playingPodId === pod.id) {
      setPlayingPodId(null);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setPlayingPodId(pod.id);
      
      const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `읽어주세요: ${pod.summary}. 주요 내용: ${pod.transcript.substring(0, 300)}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingPodId(null);
        source.start();
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      setPlayingPodId(null);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Hero Section with Background Image */}
            <div className="relative mx-6 mt-6 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 group">
              <img 
                src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1000&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Church background"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-transparent"></div>
              <div className="relative p-8 text-white min-h-[220px] flex flex-col justify-end">
                <p className="text-indigo-300 text-xs font-bold tracking-[0.2em] mb-2 uppercase">Spring 2026 Training</p>
                <h2 className="text-3xl serif leading-tight mb-4">
                  기도하는 목장,<br />부흥하는 교회
                </h2>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/20 text-xs font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  현재 과정: 1-2주차 실무 과정
                </div>
              </div>
            </div>

            {/* Visual Menu Grid */}
            <div className="px-6 mt-10 space-y-5">
              <h3 className="text-sm font-black text-slate-800 tracking-wider mb-2 ml-1">오늘의 학습 리스트</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <HomeCard 
                  onClick={() => setView('VIDEO')}
                  icon="🎥"
                  title="강의영상"
                  desc="지혜의 말씀"
                  color="bg-rose-500"
                  iconBg="bg-rose-100"
                  iconColor="text-rose-600"
                />
                <HomeCard 
                  onClick={() => setView('PODCAST')}
                  icon="🎙️"
                  title="팟캐스트"
                  desc="대담 & 통찰"
                  color="bg-violet-500"
                  iconBg="bg-violet-100"
                  iconColor="text-violet-600"
                />
                <HomeCard 
                  onClick={() => setView('TEXTBOOK')}
                  icon="📖"
                  title="교재보기"
                  desc="원리 & 지침"
                  color="bg-indigo-500"
                  iconBg="bg-indigo-100"
                  iconColor="text-indigo-600"
                />
                <HomeCard 
                  onClick={() => setView('QUIZ')}
                  icon="📝"
                  title="실무퀴즈"
                  desc="성취도 평가"
                  color="bg-amber-500"
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                />
              </div>

              {/* Enhanced Progress Section */}
              <div className="mt-10 mb-12 p-8 rounded-[2rem] glass-card border-indigo-100 relative overflow-hidden group shadow-lg shadow-indigo-50/50">
                <div className="absolute top-0 right-0 p-4 text-indigo-100/30 text-6xl group-hover:rotate-12 transition-transform duration-500">📊</div>
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">학습 진도율</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-bold text-slate-500">전체 커리큘럼 이수율</span>
                      <span className="text-xl font-black text-indigo-600">15%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-0.5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full shadow-sm transition-all duration-1000" style={{width: '15%'}}></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center italic font-medium leading-relaxed">
                    "지극히 작은 것에 충실한 자는 큰 것에도 충실하고..."<br />- 눅 16:10
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'VIDEO':
        return (
          <div className="animate-in fade-in duration-500 bg-slate-50 min-h-full pb-10">
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl serif text-slate-800">훈련 강의영상</h2>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-200"></div>
                </div>
              </div>
              
              {LESSONS.map((lesson, index) => (
                <div key={lesson.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-white mb-8 group transition-transform duration-300 hover:translate-y-[-4px]">
                  <div className="aspect-video w-full bg-slate-900 relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={lesson.videoUrl} 
                      title={`Video player ${index + 1}`} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-black text-white bg-indigo-500 px-3 py-1 rounded-full uppercase tracking-tighter">Week {index + 1}</span>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">{lesson.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">{lesson.description}</p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <p className="text-[11px] text-slate-400 font-medium">실무 가이드 포함</p>
                      <a 
                        href={lesson.watchUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
                      >
                        FULL HD 보기 <span>↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'PODCAST':
        return (
          <div className="p-6 animate-in slide-in-from-right-10 duration-500">
            <div className="mb-10 text-center py-10 rounded-[3rem] bg-indigo-50/50 border border-indigo-100/50 relative overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-indigo-100 rounded-full blur-2xl"></div>
              <div className="w-28 h-28 bg-white text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-indigo-100/50 relative z-10">🎙️</div>
              <h2 className="text-2xl serif text-slate-800 mb-2 relative z-10">목자 팟캐스트</h2>
              <p className="text-sm text-slate-500 font-medium relative z-10">지혜를 나누는 영적 대담</p>
            </div>

            <div className="space-y-6">
              {PODCASTS.map((pod) => (
                <div key={pod.id} className={`bg-white border rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 ${playingPodId === pod.id ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-xl' : 'border-slate-100'}`}>
                  <div className="p-6 flex items-center gap-5">
                    <button 
                      onClick={() => handlePlayPodcast(pod)}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all active:scale-90 ${playingPodId === pod.id ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
                    >
                      {playingPodId === pod.id ? (isGeneratingAudio ? '⌛' : '⏸') : '▶'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-tighter">WEEK {pod.week}</span>
                        <h4 className="font-bold text-slate-800 leading-tight">{pod.title}</h4>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400">{pod.speaker} • {pod.duration}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">{pod.summary}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPod(selectedPod?.id === pod.id ? null : pod)}
                        className={`text-[11px] font-black px-5 py-3 rounded-xl transition-all ${selectedPod?.id === pod.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {selectedPod?.id === pod.id ? '대담 닫기' : '대담 스크립트 전문 보기'}
                      </button>
                    </div>
                    {selectedPod?.id === pod.id && (
                      <div className="mt-5 p-6 bg-slate-50 rounded-[1.5rem] text-xs text-slate-700 leading-loose whitespace-pre-wrap border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                        {pod.transcript}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'TEXTBOOK':
        const currentLesson = LESSONS.find(l => l.id === selectedLessonId) || LESSONS[0];
        return (
          <div className="animate-in fade-in duration-500 bg-white min-h-full">
            {/* Elegant Week Selector */}
            <div className="flex p-5 bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-slate-50">
              {LESSONS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLessonId(l.id)}
                  className={`flex-1 py-3 text-sm font-black rounded-2xl transition-all ${
                    selectedLessonId === l.id 
                      ? 'bg-slate-800 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-600 bg-slate-50/50 mx-1'
                  }`}
                >
                  WEEK {i + 1}
                </button>
              ))}
            </div>

            <div className="p-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Training Manual</span>
              <h2 className="text-3xl serif text-slate-800 mb-8 leading-snug">{currentLesson.title}</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-loose space-y-8 pb-10">
                {currentLesson.textbookContent.split('\n').map((line, i) => {
                  if (line.trim().startsWith('##')) {
                    return (
                      <div key={i} className="pt-6 group">
                         <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                           <span className="w-1 h-6 bg-indigo-500 rounded-full group-hover:scale-y-125 transition-transform"></span>
                           {line.replace('##', '').trim()}
                         </h3>
                      </div>
                    );
                  }
                  if (line.trim().startsWith('-')) {
                    return (
                      <div key={i} className="flex gap-3 ml-1 mb-3">
                        <span className="text-indigo-400 mt-1">•</span>
                        <p className="text-slate-600 font-medium">{line.replace('-', '').trim()}</p>
                      </div>
                    );
                  }
                  if (line.trim() === '') return null;
                  return <p key={i} className="text-slate-600 mb-2 font-medium">{line.trim()}</p>;
                })}
              </div>
              
              <div className="mt-10 p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 p-4 opacity-10 text-6xl">❝</div>
                <p className="text-base font-medium leading-relaxed italic relative z-10 opacity-90">
                  "이 지침서가 귀하의 사역을 무거운 '짐'에서<br />하늘을 나는 '날개'로 바꾸는 결정적 전환점이 되기를 기원합니다."
                </p>
                <div className="absolute bottom-0 right-0 p-4 opacity-10 text-6xl rotate-180">❝</div>
              </div>
            </div>
          </div>
        );
      case 'QUIZ':
        return <div className="animate-in fade-in duration-700"><Quiz /></div>;
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeView={view} 
      onNavigate={setView} 
      title={view === 'HOME' ? '양지제일교회' : view === 'VIDEO' ? '훈련 강의' : view === 'PODCAST' ? '영적 대담' : view === 'TEXTBOOK' ? '사역 지침서' : '수행 평가'}
    >
      {renderContent()}
    </Layout>
  );
};

// UI Component for Home Cards
const HomeCard: React.FC<{ onClick: () => void; icon: string; title: string; desc: string; color: string; iconBg: string; iconColor: string }> = ({ onClick, icon, title, desc, color, iconBg, iconColor }) => (
  <button 
    onClick={onClick}
    className="group relative flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 active:scale-95 text-left"
  >
    <div className={`w-14 h-14 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
      {icon}
    </div>
    <h3 className="font-black text-slate-800 text-base mb-1">{title}</h3>
    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{desc}</p>
    <div className={`absolute top-6 right-6 w-1.5 h-1.5 rounded-full ${color} opacity-30`}></div>
  </button>
);

export default App;
