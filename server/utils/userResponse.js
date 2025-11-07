const buildUserResponse = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject({ getters: true, virtuals: false });
  const {
    password,
    passwordHash,
    twoFactorSecret,
    __v,
    ...safe
  } = user;
  if (safe.autoTranslate instanceof Map) {
    safe.autoTranslate = Object.fromEntries(safe.autoTranslate);
  }
  if (safe.settings instanceof Map) {
    safe.settings = Object.fromEntries(safe.settings);
  }
  safe.id = safe._id;
  delete safe._id;
  if (safe.isAdmin && safe.role !== 'admin') {
    safe.role = 'admin';
  }
  if (!safe.role) {
    safe.role = safe.isAdmin ? 'admin' : 'user';
  }
  return safe;
};

module.exports = {
  buildUserResponse
};
