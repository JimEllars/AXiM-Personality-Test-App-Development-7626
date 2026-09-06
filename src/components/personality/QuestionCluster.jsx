import React from 'react';
import { motion } from 'framer-motion';
import LikertInput from './LikertInput';

function QuestionCluster({ items, answers, onAnswer, clusterIndex }) {
  const questionOffset = clusterIndex * items.length;

  return (
    <motion.div
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