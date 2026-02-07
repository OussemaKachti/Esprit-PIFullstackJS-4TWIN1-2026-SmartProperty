/**
 * Standardized API response formatter
 */

exports.apiResponse = (success, message, data = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

exports.paginatedResponse = (success, message, data, pagination) => {
  return {
    success,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
    },
    timestamp: new Date().toISOString(),
  };
};
