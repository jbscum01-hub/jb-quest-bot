const { CONFIG } = require('../config');

function getNextCluePlaceholder(professionKey, step = 1) {
  return {
    professionKey,
    step,
    totalSteps: CONFIG.clue.totalPerProfession,
    title: `Clue ${step}`,
    content: 'TODO: ใส่ clue จริงของสายนี้',
  };
}

module.exports = { getNextCluePlaceholder };
