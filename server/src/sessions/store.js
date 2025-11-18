const users = new Map(); // userId -> { socketId, preferredLanguage }

function setPreferredLanguage(userId, lang) {
  const existing = users.get(userId) || {};
  users.set(userId, { ...existing, preferredLanguage: lang });
}

function setSocketId(userId, socketId) {
  const existing = users.get(userId) || {};
  users.set(userId, { ...existing, socketId });
}

function getPreferredLanguage(userId) {
  const entry = users.get(userId);
  return entry ? entry.preferredLanguage : null;
}

function getAllUsers() {
  const out = [];
  for (const [userId, info] of users.entries()) {
    out.push({ userId, ...info });
  }
  return out;
}

function removeUser(userId) {
  users.delete(userId);
}

export { setPreferredLanguage, getPreferredLanguage, getAllUsers, setSocketId, removeUser };
