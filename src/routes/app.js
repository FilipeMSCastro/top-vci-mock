const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../auth');
const { renderAppShell } = require('../views');
const store = require('../store');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const REQUIRED_FIELDS = [
  'plate',
  'origemLocal', 'origemDate', 'origemTime',
  'cargaLocal', 'cargaDate', 'cargaTime',
  'descargaLocal', 'descargaDate', 'descargaTime',
  'destinoLocal', 'destinoDate', 'destinoTime',
];

function formatDateTime(date, time) {
  if (!date || !time) return '';
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}, ${time}`;
}

router.get('/app', requireAuth, (req, res) => {
  const activeTab = req.query.tab === 'registos-submetidos' ? 'registos-submetidos' : 'novo-registo';
  const wizardError = req.session.flashError;
  const formValues = req.session.flashFormValues;
  const confirmado = req.query.confirmado || null;
  delete req.session.flashError;
  delete req.session.flashFormValues;

  res.send(renderAppShell({
    user: req.session.user,
    activeTab,
    wizardError,
    formValues,
    confirmado,
    records: store.listSubmittedRequests(),
  }));
});

router.post('/app/novo-registo/submit', requireAuth, upload.array('documentos', 10), (req, res) => {
  const body = req.body;
  const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
  const files = req.files || [];

  if (missing.length > 0 || files.length === 0) {
    req.session.flashError = files.length === 0
      ? 'Documento de transporte obrigatório.'
      : 'Preencha todos os campos obrigatórios.';
    req.session.flashFormValues = body;
    return res.redirect('/app?tab=novo-registo&erro=1');
  }

  const originDateTime = `${body.origemDate}T${body.origemTime}`;

  if (store.findDuplicate(body.plate, originDateTime)) {
    req.session.flashError = 'Já existe um pedido submetido para esta Matrícula neste período.';
    req.session.flashFormValues = body;
    return res.redirect('/app?tab=novo-registo&erro=1');
  }

  const atcuds = Array.isArray(body.atcud) ? body.atcud : [body.atcud].filter(Boolean);
  const documents = files.map((file, i) => ({
    filename: file.originalname,
    atcud: atcuds[i] || '',
  }));

  const record = store.addSubmittedRequest({
    plateCountry: 'Portugal',
    plate: body.plate,
    origemLocal: body.origemLocal,
    origemDate: body.origemDate,
    origemTime: body.origemTime,
    // Chave exata usada no anti-duplicados e na geração do código — nunca reformatar.
    originDateTime,
    originDateTimeDisplay: formatDateTime(body.origemDate, body.origemTime),
    cargaLocal: body.cargaLocal,
    cargaDate: body.cargaDate,
    cargaTime: body.cargaTime,
    descargaLocal: body.descargaLocal,
    descargaDate: body.descargaDate,
    descargaTime: body.descargaTime,
    destinoLocal: body.destinoLocal,
    destinoDate: body.destinoDate,
    destinoTime: body.destinoTime,
    destinoDateTimeDisplay: formatDateTime(body.destinoDate, body.destinoTime),
    documents,
  });

  return res.redirect(`/app?tab=novo-registo&confirmado=${encodeURIComponent(record.requestCode)}`);
});

router.get('/app/registos-submetidos/:code/detalhe', requireAuth, (req, res) => {
  const record = store.getSubmittedRequestByCode(req.params.code);
  if (!record) return res.status(404).json({ error: 'not_found' });
  res.json(record);
});

module.exports = router;
