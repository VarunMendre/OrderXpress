function register(_req, res) {
  return res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Auth register is not implemented yet.' } });
}

function login(_req, res) {
  return res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Auth login is not implemented yet.' } });
}

function logout(_req, res) {
  return res.status(200).json({ success: true, data: { message: 'Logged out' } });
}

function me(_req, res) {
  return res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Auth me is not implemented yet.' } });
}

module.exports = { register, login, logout, me };
