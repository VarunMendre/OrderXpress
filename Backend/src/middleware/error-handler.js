function errorHandler(error, _req, res, _next) {
  console.error('[error]', error);
  const status = error.statusCode || 500;
  const code =
    status === 400
      ? 'VALIDATION_ERROR'
      : status === 401
        ? 'UNAUTHORIZED'
        : status === 404
          ? 'NOT_FOUND'
          : 'INTERNAL_SERVER_ERROR';

  return res.status(status).json({
    success: false,
    error: {
      code,
      message: error.message || 'Something went wrong.'
    }
  });
}

module.exports = { errorHandler };
