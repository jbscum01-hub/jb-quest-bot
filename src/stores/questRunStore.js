const { CONFIG } = require('../config');

class QuestRunStore {
  constructor() {
    this.runs = [];
  }

  create(data) {
    const record = {
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clueStep: 1,
      ...data,
    };

    this.runs.push(record);
    return record;
  }

  findActiveByUserAndProfession(userId, professionKey) {
    return this.runs.find((run) => {
      return (
        run.professionKey === professionKey &&
        run.status === CONFIG.questStatus.ACTIVE &&
        Array.isArray(run.memberUserIds) &&
        run.memberUserIds.includes(userId)
      );
    }) || null;
  }

  findByChannelId(channelId) {
    return this.runs.find((run) => run.channelId === channelId) || null;
  }

  updateStatus(channelId, status) {
    const run = this.findByChannelId(channelId);
    if (!run) return null;
    run.status = status;
    run.updatedAt = new Date().toISOString();
    return run;
  }
}

const questRunStore = new QuestRunStore();

module.exports = { questRunStore };
