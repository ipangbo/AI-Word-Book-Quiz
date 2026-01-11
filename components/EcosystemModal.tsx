import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Globe, Sparkles, BookOpen, Repeat } from 'lucide-react';
import { Ripple } from './common/Ripple';

interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EcosystemModal: React.FC<EcosystemModalProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      id: 1,
      name: 'CineGlot',
      description: '生词筛选与语境提取。从电影、电视剧字幕文件中快速锁定生词，并保留其原始对白语境。',
      icon: <Globe size={24} />,
      link: '#', 
      color: 'bg-blue-500',
      tag: '数据源'
    },
    {
      id: 2,
      name: 'AI单词书助手',
      description: 'AI 赋能数据加工。利用大模型自动为生词生成地道的中文释义、音标，并整理成标准的 LaTeX 格式。',
      icon: <Sparkles size={24} />,
      link: 'https://chatgpt.com/g/g-680a05e7e40c819188f661e74f64e938-aidan-ci-shu-zhu-shou',
      color: 'bg-purple-500',
      tag: 'AI 加工'
    },
    {
      id: 3,
      name: 'AI Word Book',
      description: '纸质化沉浸式学习。通过 LaTeX 模板，将筛选出的语境词汇制作成可打印的出版物。',
      icon: <BookOpen size={24} />,
      link: 'https://github.com/ipangbo/LaTeX-AI-Word-Book',
      color: 'bg-amber-500',
      tag: '深度阅读'
    },
    {
      id: 4,
      name: 'CineVocab',
      description: '数字化高频复习。将带有语境的生词列表转化为多种互动 Quiz（闪卡、听写、填空、选择），巩固记忆。',
      icon: <Repeat size={24} />,
      link: null, 
      color: 'bg-emerald-500',
      tag: '智能复习',
      isCurrent: true
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-md-surface dark:bg-md-surface rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-md-surface-container flex items-center justify-between bg-md-surface dark:bg-md-surface z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-md-primary text-md-on-primary rounded-xl">
                  <Repeat size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-md-on-surface">英语学习全流程闭环</h2>
                    <p className="text-xs text-md-outline font-medium">从生词提取到深度记忆</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container transition-colors"
              >
                <Ripple />
                <X size={24} className="text-md-outline relative z-10" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-md-surface-container/20 dark:bg-black/20">
              <div className="space-y-4">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`relative group bg-white dark:bg-md-surface-container p-5 rounded-[24px] border shadow-sm transition-all ${
                        step.isCurrent 
                        ? 'border-md-primary bg-md-primary/5 dark:bg-md-primary/10 ring-4 ring-md-primary/5 dark:ring-md-primary/10' 
                        : 'border-md-outline/10 hover:border-md-primary/30 hover:shadow-md dark:border-md-outline/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                        <div className={`${step.color} text-white p-3 rounded-2xl shadow-inner group-hover:scale-105 transition-transform`}>
                            {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-md-on-surface">{step.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        step.isCurrent ? 'bg-md-primary text-md-on-primary' : 'bg-md-surface-container text-md-outline'
                                    }`}>
                                        {step.tag}
                                    </span>
                                </div>
                                {step.link && (
                                    <a 
                                      href={step.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="relative overflow-hidden p-2 rounded-full text-md-primary hover:bg-md-primary/10 transition-colors"
                                    >
                                        <Ripple />
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-md-outline leading-relaxed pr-8">
                                {step.description}
                            </p>
                        </div>
                    </div>
                    {step.isCurrent && (
                        <div className="absolute top-2 right-12">
                            <span className="text-[10px] font-black text-md-primary bg-md-primary-container dark:bg-md-primary-container px-2 py-1 rounded-bl-xl rounded-tr-xl">YOU ARE HERE</span>
                        </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Tip */}
              <div className="mt-4 p-6 bg-md-secondary-container/30 dark:bg-md-secondary-container/20 rounded-[24px] border border-md-secondary-container/50 dark:border-md-secondary-container/30">
                <h4 className="font-bold text-md-on-secondary-container text-sm mb-2 flex items-center gap-2">
                    <Repeat size={16} /> 为什么需要这个闭环？
                </h4>
                <p className="text-xs text-md-on-secondary-container/80 leading-relaxed">
                    传统的背单词往往脱离语境。我们的流程确保你：1. 学习真实台词；2. 利用 AI 获取最精准的释义；3. 结合纸质阅读加深理解；4. 通过 CineVocab 在碎片时间进行高频的互动复习。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-[10px] text-md-outline uppercase tracking-widest font-bold bg-md-surface dark:bg-md-surface border-t border-md-surface-container">
              Ecosystem Map • Cinematic Language Mastery
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};