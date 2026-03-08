require('dotenv').config();

function readEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const CONFIG = {
  app: {
    name: 'Treasure Hunt Bot',
    version: '1.3.0',
    env: readEnv('NODE_ENV', 'development'),
  },

  discord: {
    token: readEnv('DISCORD_TOKEN'),
    clientId: readEnv('CLIENT_ID'),
    guildId: readEnv('GUILD_ID'),

    channels: {
      ticketCategoryId: readEnv('TICKET_CATEGORY_ID'),
      logChannelId: readEnv('LOG_CHANNEL_ID'),
      adminControlChannelId: readEnv('ADMIN_CONTROL_CHANNEL_ID'),
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

  ui: {
    adminControlCustomId: 'admin_panel_control',
    adminCreateAllPanels: 'admin_create_all_panels',
    adminRefreshAllPanels: 'admin_refresh_all_panels',
    adminCheckPanelStatus: 'admin_check_panel_status',
    professionStartPrefix: 'start_profession_',
    adminCreatePanelPrefix: 'admin_create_panel_',
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
      color: 0x5bc0eb,
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
      color: 0x8bc34a,
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
      color: 0x4f6d3a,
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
      color: 0x3f88c5,
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
      color: 0x9c6644,
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
      color: 0xf4a261,
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
      color: 0xe9c46a,
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
      color: 0x6d597a,
    },
    pilot: {
      key: 'pilot',
      name: 'สายนักบิน',
      emoji: '✈️',
      displayName: '✈️ lv5-นักบินผู้ไม่หลงทาง',
      ticketChannelPrefix: 'ticket-pilot',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      allowSolo: true,
      minTeamSize: 1,
      maxTeamSize: 1,
      color: 0xe76f51,
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
