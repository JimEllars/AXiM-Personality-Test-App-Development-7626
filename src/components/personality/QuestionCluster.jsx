import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScenarioCardInput,
  TradeoffSliderInput,
  ReactionDilemmaInput,
  ModernLikertInput
} from './inputs';

function QuestionCluster({ items, answers, onAnswer, clusterIndex }) {
  const questionOffset = clusterIndex * items.length;
  const containerRef = useRef(null);

  useEffect(() => {
    const handleConfirm = (e) => {
      // Find current article
      const currentCard = e.target.closest('.question-card');
      if (currentCard) {
        // Find next card
        let nextCard = currentCard.nextElementSibling;
        if (!nextCard && currentCard.parentElement.nextElementSibling) {
            // Might be the submit button or next cluster
            const allCards = Array.from(document.querySelectorAll('.question-card'));
            const currentIndex = allCards.indexOf(currentCard);
            if (currentIndex !== -1 && currentIndex + 1 < allCards.length) {
                nextCard = allCards[currentIndex + 1];
            }
        }

        if (nextCard) {
           nextCard.focus({ preventScroll: true });
           nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('axim-likert-confirm', handleConfirm);
    }
    return () => {
      if (container) {
        container.removeEventListener('axim-likert-confirm', handleConfirm);
      }
    };
  }, []);

  const renderInputComponent = (item) => {
    const value = answers[item.id];
    const onChange = (val) => onAnswer(item.id, val);

    switch (item.type) {
      case 'scenario':
        return <ScenarioCardInput item={item} value={value} onChange={onChange} />;
      case 'tradeoff':
        return <TradeoffSliderInput item={item} value={value} onChange={onChange} />;
      case 'reaction':
        return <ReactionDilemmaInput item={item} value={value} onChange={onChange} />;
      case 'likert':
      default:
        return <ModernLikertInput item={item} value={value} onChange={onChange} />;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      key={clusterIndex}
      className="question-list flex flex-col gap-8 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.28 }}
    >
      <div aria-live="polite" className="sr-only" aria-atomic="true">
        Showing question cluster {clusterIndex + 1}
      </div>
      <AnimatePresence>
        {items.map((item, index) => {
          const answered = Number.isInteger(answers[item.id]);
          const questionNumber = questionOffset + index + 1;

          return (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`question-card p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors ${answered ? 'ring-1 ring-blue-100 dark:ring-blue-900/50' : ''}`}
              role="group"
              data-question-id={item.id}
              key={item.id}
              tabIndex="-1"
              aria-labelledby={`${item.id}-prompt`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold text-sm">
                  {String(questionNumber).padStart(2, '0')}
                </div>
                <div className="flex-grow w-full">
                  <h3 id={`${item.id}-prompt`} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {item.prompt}
                  </h3>
                  {item.context && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
                      {item.context}
                    </p>
                  )}
                  {renderInputComponent(item)}
                </div>
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

export default QuestionCluster;
