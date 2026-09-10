const session = require('express-session');

const SEED_ACCOUNT = {
  email: process.env.MOCK_VCI_EMAIL || 'demo@vci-mock.local',
  password: process.env.MOCK_VCI_PASSWORD || 'demo-password',
};

function sessionMiddleware() {
  return session({
    secret: 'siga-vp-sandbox-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  });
}

function checkCredentials(email, password) {
  return email === SEED_ACCOUNT.email && password === SEED_ACCOUNT.password;
}

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = { SEED_ACCOUNT, sessionMiddleware, checkCredentials, requireAuth };
