const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "token",
  "jwt",
  "authorization",
  "secret",
]);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, item]) => {
      if (!SENSITIVE_KEYS.has(key)) {
        acc[key] = sanitizeValue(item);
      }
      return acc;
    }, {});
  }

  return value;
};

module.exports = sanitizeValue;
