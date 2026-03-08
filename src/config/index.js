require('dotenv').config();

function readEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const CONFIG = {
  app: {
    name: 'Treasure Hunt Bot',
    version: '1.5.0',
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

  questStatus: {
    PENDING_APPROVAL: 'pending_approval',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned',
    REJECTED: 'rejected',
  },

  ui: {
    adminCreateAllPanels: 'admin_create_all_panels',
    adminRefreshAllPanels: 'admin_refresh_all_panels',
    adminCheckPanelStatus: 'admin_check_panel_status',
    adminCreatePanelPrefix: 'admin_create_panel_',

    openTicketPrefix: 'open_ticket_profession_',

    huntApprove: 'hunt_approve',
    huntReject: 'hunt_reject',
    huntShowClue: 'hunt_show_clue',
    huntUnlockNextClue: 'hunt_unlock_next_clue',
    huntAbandon: 'hunt_abandon',
    huntComplete: 'hunt_complete',
    huntCloseTicket: 'hunt_close_ticket',
  },

  professions: {
    medic: {
      key: 'medic',
      name: 'แพทย์',
      emoji: '🩺',
      displayName: '🩺 แพทย์สนาม',
      ticketChannelPrefix: 'ticket-medic',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x5bc0eb,
    },
    farmer: {
      key: 'farmer',
      name: 'เกษตรกร',
      emoji: '🌾',
      displayName: '🌾 ตำนานเกษตรกร',
      ticketChannelPrefix: 'ticket-farmer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x8bc34a,
    },
    soldier: {
      key: 'soldier',
      name: 'สนามรบ',
      emoji: '🪖',
      displayName: '🪖 ผู้บัญชาการสนามรบ',
      ticketChannelPrefix: 'ticket-soldier',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x4f6d3a,
    },
    fisher: {
      key: 'fisher',
      name: 'ตกปลา',
      emoji: '🎣',
      displayName: '🎣 ตำนานนักตกปลา',
      ticketChannelPrefix: 'ticket-fisher',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x3f88c5,
    },
    hunter: {
      key: 'hunter',
      name: 'นักล่า',
      emoji: '🦌',
      displayName: '🦌 ตำนานนักล่า',
      ticketChannelPrefix: 'ticket-hunter',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x9c6644,
    },
    explorer: {
      key: 'explorer',
      name: 'นักสำรวจ',
      emoji: '🧭',
      displayName: '🧭 ผู้พิชิตแผนที่',
      ticketChannelPrefix: 'ticket-explorer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0xf4a261,
    },
    chef: {
      key: 'chef',
      name: 'อาหาร',
      emoji: '👨‍🍳',
      displayName: '👨‍🍳 ตำนานเชฟผู้รอดชีวิต',
      ticketChannelPrefix: 'ticket-chef',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0xe9c46a,
    },
    engineer: {
      key: 'engineer',
      name: 'ช่าง',
      emoji: '🔧',
      displayName: '🔧 วิศวกรผู้เอาตัวรอด',
      ticketChannelPrefix: 'ticket-engineer',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
      color: 0x6d597a,
    },
    pilot: {
      key: 'pilot',
      name: 'นักบิน',
      emoji: '✈️',
      displayName: '✈️ นักบินผู้ไร้ขอบฟ้า',
      ticketChannelPrefix: 'ticket-pilot',
      roleId: 'PUT_ROLE_ID_HERE',
      enabled: true,
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
