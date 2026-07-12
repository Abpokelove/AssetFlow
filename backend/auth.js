const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const employeeRepository = require("./repositories/employeeRepository");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
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

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
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

  return {
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

module.exports = {
  registerUser,
  loginUser,
  authMiddleware,
};
