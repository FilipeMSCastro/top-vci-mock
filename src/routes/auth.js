const express = require('express');
const { checkCredentials } = require('../auth');
const { renderLogin, renderRegisto } = require('../views');

const router = express.Router();

router.get('/login', (req, res) => {
  const error = req.session.flashError;
  delete req.session.flashError;
  res.send(renderLogin({ error }));
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (checkCredentials(email, password)) {
    req.session.authenticated = true;
    req.session.user = { email, name: email.split('@')[0] };
    return res.redirect('/app');
  }
  req.session.flashError = 'Credenciais inválidas.';
  return res.redirect('/login');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

router.get('/registo', (req, res) => {
  res.send(renderRegisto({ success: req.query.sucesso === '1' }));
});

router.post('/registo', (req, res) => {
  // Cosmético — não cria conta real (única conta válida é a conta de serviço seed).
  res.redirect('/registo?sucesso=1');
});

module.exports = router;
