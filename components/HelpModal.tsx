import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MessageSquare, Info, Zap } from 'lucide-react';
import { Ripple } from './common/Ripple';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-md-surface-container rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-md-surface-container flex items-center justify-between bg-md-surface-container/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-md-primary text-md-on-primary rounded-xl">
                  <HelpCircle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-md-on-surface">使用指南与帮助</h2>
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
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
              {/* Quick Start */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-md-primary">
                  <Zap size={20} />
                  <h3 className="text-lg font-bold">快速入门</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 bg-md-primary-container text-md-on-primary-container rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-md-on-surface">准备数据</h4>
                      <p className="text-sm text-md-outline leading-relaxed">按照本应用的 LaTeX 模板格式准备您的单词数据。每条数据应包含句子语境、翻译、单词释义及音标。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 bg-md-primary-container text-md-on-primary-container rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-md-on-surface">导入内容</h4>
                      <p className="text-sm text-md-outline leading-relaxed">在首页将文本粘贴到输入框中，或者直接将 <code className="bg-md-surface-container px-1 rounded">.tex</code> 或 <code className="bg-md-surface-container px-1 rounded">.txt</code> 文件拖拽到上传区。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 bg-md-primary-container text-md-on-primary-container rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-md-on-surface">解析与预览</h4>
                      <p className="text-sm text-md-outline leading-relaxed">点击“解析数据”进入预览界面。您可以查看解析出的所有句子和单词，确保无误后继续。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 bg-md-primary-container text-md-on-primary-container rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-bold text-md-on-surface">开始练习</h4>
                      <p className="text-sm text-md-outline leading-relaxed">选择适合的学习模式：<strong>闪卡</strong>（记忆巩固）、<strong>听写</strong>（听力强化）或<strong>填空</strong>（拼写语境练习）。</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-md-primary">
                  <MessageSquare size={20} />
                  <h3 className="text-lg font-bold">常见问题 (FAQ)</h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-md-surface-container/30 p-4 rounded-2xl border border-md-surface-container">
                    <h4 className="font-bold text-sm text-md-on-surface mb-2">Q: 数据格式要求是怎样的？</h4>
                    <p className="text-sm text-md-outline leading-relaxed">应用识别以 <code className="text-md-primary">\SentenceBlock</code> 开头的特定 LaTeX 格式。这允许我们将单词与其在电影/美剧中的原始台词紧密结合，提供最佳语境。</p>
                  </div>
                  <div className="bg-md-surface-container/30 p-4 rounded-2xl border border-md-surface-container">
                    <h4 className="font-bold text-sm text-md-on-surface mb-2">Q: 练习时没有声音怎么办？</h4>
                    <p className="text-sm text-md-outline leading-relaxed">请确保您的设备未静音。如果仍然没有声音，请进入右上角的“设置”，在“语音与播放”部分手动选择一个英文语音引擎，并尝试点击“测试语音”。</p>
                  </div>
                  <div className="bg-md-surface-container/30 p-4 rounded-2xl border border-md-surface-container">
                    <h4 className="font-bold text-sm text-md-on-surface mb-2">Q: 听写或填空时单词填错了，如何后续复习？</h4>
                    <p className="text-sm text-md-outline leading-relaxed">在结果页面（Results），我们会列出所有答错或跳过的单词。您可以点击“Copy”按钮一键复制这些单词的 LaTeX 代码，保存下来以便下次重新导入复习。</p>
                  </div>
                </div>
              </section>

              {/* Tips */}
              <section className="bg-md-primary/5 p-6 rounded-3xl border border-md-primary/10">
                <div className="flex items-center gap-2 mb-3 text-md-primary">
                  <Info size={18} />
                  <h4 className="font-bold">小贴士</h4>
                </div>
                <ul className="text-xs text-md-on-surface/70 list-disc list-inside space-y-2">
                  <li>使用键盘快捷键 <kbd className="bg-white dark:bg-black border px-1 rounded shadow-sm">Alt + R</kbd> 可以在听写模式下快速重复播放音频。</li>
                  <li>在设置中可以调整自动跳转的延迟时间，适应您的学习节奏。</li>
                  <li>填空模式下如果实在听不出，可以点击“音频提示”播放整个句子作为参考。</li>
                </ul>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-[10px] text-md-outline uppercase tracking-widest font-bold bg-md-surface-container/20">
              CineVocab Material v1.2 • 语境驱动学习
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};