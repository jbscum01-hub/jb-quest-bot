require('dotenv').config();

function readEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const CONFIG = {
  app: {
    name: 'Treasure Hunt Bot',
    version: '1.2.0',
    env: readEnv('NODE_ENV', 'development'),
  },

  discord: {
    token: readEnv('DISCORD_TOKEN'),
    clientId: readEnv('CLIENT_ID'),
    guildId: readEnv('GUILD_ID'),

    channels: {
      ticketCategoryId: readEnv('TICKET_CATEGORY_ID'),
      logChannelId: readEnv('LOG_CHANNEL_ID'),
    },

    roles: {
      adminRoleId: readEnv('ADMIN_ROLE_ID'),
      staffRoleId: readEnv('STAFF_ROLE_ID'),
    },
  },

  database: {
    url: readEnv('DATABASE_URL'),
    ssl: true,
  },

  settings: {
    mode: 'solo_only',
    allowSoloDefault: true,
    minTeamSizeDefault: 1,
    maxTeamSizeDefault: 1,
    cooldownType: 'once_per_user',
    abandonedCountsAsCancel: false,
  },

  questStatus: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned',
    CANCELLED: 'cancelled',
  },

  antiLeak: {
    restrictTicketViewToStarter: true,
    allowStaffView: true,
    allowAdminView: true,
    hideClueHistory: true,
    lockClueAfterNext: false,
  },

  clue: {
    totalPerProfession: 4,
    unlockInOrderOnly: true,
  },

  professions: {
    medic: {
      key: 'medic',
      name: 'สายแพทย์',
      emoji: '🩺',
      displayName: '🩺 lv5-ผู้กอบกู้ชีวิต',
      ticketChannelPrefix: 'ticket-medic',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    farmer: {
      key: 'farmer',
      name: 'สายเกษตร',
      emoji: '🌾',
      displayName: '🌾 lv5-ตำนานเกษตรกร',
      ticketChannelPrefix: 'ticket-farmer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    soldier: {
      key: 'soldier',
      name: 'สายสนามรบ',
      emoji: '🪖',
      displayName: '🪖 lv5-ผู้บัญชาการสนามรบ',
      ticketChannelPrefix: 'ticket-soldier',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    fisher: {
      key: 'fisher',
      name: 'สายตกปลา',
      emoji: '🎣',
      displayName: '🎣 lv5-ตำนานนักตกปลา',
      ticketChannelPrefix: 'ticket-fisher',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    hunter: {
      key: 'hunter',
      name: 'สายนักล่า',
      emoji: '🦌',
      displayName: '🦌 lv5-ตำนานนักล่า',
      ticketChannelPrefix: 'ticket-hunter',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    explorer: {
      key: 'explorer',
      name: 'สายนักสำรวจ',
      emoji: '🧭',
      displayName: '🧭 lv5-ผู้พิชิตแผนที่',
      ticketChannelPrefix: 'ticket-explorer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    chef: {
      key: 'chef',
      name: 'สายอาหาร',
      emoji: '👨‍🍳',
      displayName: '👨‍🍳 lv5-ตำนานเชฟผู้รอดชีวิต',
      ticketChannelPrefix: 'ticket-chef',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    engineer: {
      key: 'engineer',
      name: 'สายช่าง',
      emoji: '🔧',
      displayName: '🔧 lv5-วิศวกรเอาตัวรอด',
      ticketChannelPrefix: 'ticket-engineer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
    scavenger: {
      key: 'scavenger',
      name: 'สายลูท',
      emoji: '🎒',
      displayName: '🎒 lv5-ราชันนักค้นหา',
      ticketChannelPrefix: 'ticket-scavenger',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
    },
  },
};

function getProfessionByKey(key) {
  return CONFIG.professions[key] || null;
}

function getAllProfessions() {
  return Object.values(CONFIG.professions);
}

function getEnabledProfessions() {
  return Object.values(CONFIG.professions).filter((profession) => profession.enabled);
}

function getRequiredEnvWarnings() {
  const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'DATABASE_URL'];
  return required.filter((key) => !process.env[key]);
}

module.exports = {
  CONFIG,
  getProfessionByKey,
  getAllProfessions,
  getEnabledProfessions,
  getRequiredEnvWarnings,
};
