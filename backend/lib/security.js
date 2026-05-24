const crypto = require("crypto");

function hashPassword(password) {
  const normalizedPassword = String(password || "");
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(normalizedPassword, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, hashedValue] = String(passwordHash || "").split(":");
  if (!salt || !hashedValue) {
    return false;
  }

  const derived = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(hashedValue, "hex"));
}

module.exports = {
  hashPassword,
  verifyPassword
};
