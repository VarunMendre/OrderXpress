function errorHandler(error, _req, res, _next) {
  console.error('[error]', error);
  return res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' } });
}

module.exports = { errorHandler };
