const crypto = require('crypto');

/** @type {Array<object>} SubmittedRequest[] — em memória, sem persistência. */
const submittedRequests = [];

/**
 * Código determinístico no padrão "AAAA999999" (4 letras + 6 dígitos),
 * derivado do par (plate, originDateTime). Mesma combinação => sempre o
 * mesmo código, para suportar gravação HAR e testes repetíveis.
 */
function generateRequestCode(plate, originDateTime) {
  const hash = crypto
    .createHash('sha256')
    .update(`${plate}|${originDateTime}`)
    .digest();

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters[hash[i] % letters.length];
  }
  for (let i = 4; i < 10; i++) {
    code += hash[i] % 10;
  }
  return code;
}

function findDuplicate(plate, originDateTime) {
  return submittedRequests.find(
    (r) => r.plate === plate && r.originDateTime === originDateTime
  );
}

function addSubmittedRequest(data) {
  const record = {
    ...data,
    requestCode: generateRequestCode(data.plate, data.originDateTime),
    submittedAt: new Date().toISOString(),
  };
  submittedRequests.push(record);
  return record;
}

function listSubmittedRequests() {
  return [...submittedRequests].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );
}

function getSubmittedRequestByCode(code) {
  return submittedRequests.find((r) => r.requestCode === code);
}

module.exports = {
  generateRequestCode,
  findDuplicate,
  addSubmittedRequest,
  listSubmittedRequests,
  getSubmittedRequestByCode,
};
