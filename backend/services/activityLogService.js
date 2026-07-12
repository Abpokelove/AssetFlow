const activityLogRepository = require("../repositories/activityLogRepository");

const activityLogService = {
  async getActivityLogs(params) {
    return activityLogRepository.findFiltered(params);
  },
};

module.exports = activityLogService;
