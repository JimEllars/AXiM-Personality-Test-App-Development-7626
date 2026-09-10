import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import LikertInput from './LikertInput';

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
            // Might be the submit button or next cluster, we can't reliably jump across motion.div siblings here easily,
            // but we can try to find the next unanswered question on the page.
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

  return (
    <motion.div
      ref={containerRef}
      key={clusterIndex}
      className="question-list"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.28 }}
    >
      {items.map((item, index) => {
        const answered = Number.isInteger(answers[item.id]);
        const questionNumber = questionOffset + index + 1;

        return (
          <article
            className={`question-card ${answered ? 'answered' : ''}`}
            role="group"

            data-question-id={item.id}
            key={item.id}
            tabIndex="0"
            aria-labelledby={`${item.id}-prompt`}
          >
            <div className="question-number">
              {String(questionNumber).padStart(2, '0')}
            </div>
            <div className="question-content">
              <h3 id={`${item.id}-prompt`}>{item.prompt}</h3>
              <LikertInput
                itemId={item.id}
                value={answers[item.id]}
                onChange={(value) => onAnswer(item.id, value)}
              />
            </div>
          </article>
        );
      })}
    </motion.div>
  );
}

export default QuestionCluster;