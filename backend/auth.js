const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const employeeRepository = require("./repositories/employeeRepository");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const ROLE_ALIASES = {
  ADMINISTRATOR: "ADMIN",
  ASSET_MANAGER: "ASSET_MANAGER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  IT_LEAD: "DEPARTMENT_HEAD",
  HR_MANAGER: "DEPARTMENT_HEAD",
  CFO: "DEPARTMENT_HEAD",
  MARKETING_HEAD: "DEPARTMENT_HEAD",
  SALES_DIRECTOR: "DEPARTMENT_HEAD",
  OPERATIONS_MANAGER: "DEPARTMENT_HEAD",
  EMPLOYEE: "EMPLOYEE",
};

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const normalizeRoleName = (role) => {
  if (!role || typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return ROLE_ALIASES[normalized] || normalized;
};

const getUserRoles = (user = {}) => {
  const roleValues = [
    ...(Array.isArray(user.roles) ? user.roles : []),
    user.role,
  ];

  return [...new Set(roleValues.map(normalizeRoleName).filter(Boolean))];
};

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role, roles: user.roles || [] }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const registerUser = async ({ name, email, password, role = "Employee" }) => {
  if (!email) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }
  
  const existing = await employeeRepository.findByEmail(email.trim().toLowerCase());
  if (existing) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const employee = await employeeRepository.create({
    name,
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
  });
  const roles = await employeeRepository.findRolesByEmployeeId(employee.id);

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    roles: roles.length > 0 ? roles : [normalizeRoleName(employee.role)],
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const user = await employeeRepository.findByEmail(email.trim().toLowerCase());
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }
  const roles = await employeeRepository.findRolesByEmployeeId(user.id);
  const userRoles = roles.length > 0 ? roles : [normalizeRoleName(user.role)];

  return {
    token: createToken({ ...user, roles: userRoles }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: userRoles,
    },
  };
};

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    const authError = new Error("Invalid or expired token");
    authError.statusCode = 401;
    return next(authError);
  }
};

const requireRoles = (...allowedRoles) => (req, res, next) => {
  const allowed = allowedRoles.map(normalizeRoleName).filter(Boolean);
  const userRoles = getUserRoles(req.user);
  const isAllowed = userRoles.some((role) => allowed.includes(role));

  if (!isAllowed) {
    const error = new Error("Insufficient permissions");
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

const requireSelfOrRoles = (paramName, ...allowedRoles) => (req, res, next) => {
  if (req.user?.id && req.params[paramName] === req.user.id) {
    return next();
  }

  return requireRoles(...allowedRoles)(req, res, next);
};

module.exports = {
  registerUser,
  loginUser,
  authMiddleware,
  requireRoles,
  requireSelfOrRoles,
  normalizeRoleName,
  getUserRoles,
};
