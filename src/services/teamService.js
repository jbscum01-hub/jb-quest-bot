function validateTeamSize(memberCount, profession) {
  if (memberCount < profession.minTeamSize) {
    return {
      ok: false,
      message: `ทีมต้องมีอย่างน้อย ${profession.minTeamSize} คน`,
    };
  }

  if (memberCount > profession.maxTeamSize) {
    return {
      ok: false,
      message: `ทีมต้องมีไม่เกิน ${profession.maxTeamSize} คน`,
    };
  }

  return { ok: true };
}

module.exports = { validateTeamSize };
