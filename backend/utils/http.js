const createError = (message, statusCode = 500, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const parsePositiveInt = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return max ? Math.min(parsed, max) : parsed;
};

const getPagination = (query = {}) => ({
  page: parsePositiveInt(query.page, 1),
  pageSize: parsePositiveInt(query.pageSize, 10, 100),
});

const sendData = (res, data, statusCode = 200) => res.status(statusCode).json({ data });

const sendList = (res, result, statusCode = 200) => {
  const page = result.page || 1;
  const pageSize = result.pageSize || (Array.isArray(result.data) ? result.data.length : 10);
  return res.status(statusCode).json({
    data: result.data || [],
    total: Number(result.total || 0),
    page,
    pageSize,
  });
};

const sendMutation = (res, data, statusCode = 200, message = "Operation completed successfully") =>
  res.status(statusCode).json({ message, data });

module.exports = {
  asyncHandler,
  createError,
  getPagination,
  parsePositiveInt,
  sendData,
  sendList,
  sendMutation,
};
