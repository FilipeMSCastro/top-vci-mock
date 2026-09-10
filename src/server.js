const express = require('express');
const path = require('path');
const { sessionMiddleware } = require('./auth');
const authRoutes = require('./routes/auth');
const appRoutes = require('./routes/app');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.redirect('/login'));
app.use('/', authRoutes);
app.use('/', appRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`siga-vp-sandbox a correr em http://localhost:${PORT}`);
});
