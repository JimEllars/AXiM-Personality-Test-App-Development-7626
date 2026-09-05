import React from 'react';
import { motion } from 'framer-motion';
import LikertInput from './LikertInput';

function QuestionCluster({ items, answers, onAnswer, clusterIndex }) {
  return (
    <motion.div
      key={clusterIndex}
      className="question-list"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.28 }}
    >
      {items.map((item, index) => (
        <article
          className="question-card"
          data-question-id={item.id}
          key={item.id}
        >
          <div className="question-number">
            {String(clusterIndex * 6 + index + 1).padStart(2, '0')}
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
      ))}
    </motion.div>
  );
}

export default QuestionCluster;