function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function layout(title, bodyHtml) {
  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — SIGA-VP (mock)</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function authShell(innerHtml) {
  return `
<div class="auth-layout">
  <aside class="auth-sidebar">
    <h1>SIGA-VP</h1>
    <p>Gestão da circulação e do acesso de veículos pesados de mercadorias à Via Perimetral</p>
  </aside>
  <main class="auth-main">
    ${innerHtml}
    <footer class="auth-footer">
      © Município de Vilarinho 2026. Todos os direitos reservados.
      Política de Privacidade | Termos e condições | Informações úteis
    </footer>
  </main>
</div>`;
}

function renderLogin({ error } = {}) {
  return layout('Entrar', authShell(`
    <h2>Entrar</h2>
    <p class="muted">Bem-vindo(a)!</p>
    <p class="muted">Entre na sua conta SIGA-VP</p>
    <p>Ainda não tem conta? <a href="/registo">Faça aqui o seu registo</a></p>
    ${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
    <form method="post" action="/login">
      <label for="email">E-mail *</label>
      <input type="email" id="email" name="email" required />
      <label for="password">Palavra-passe *</label>
      <input type="password" id="password" name="password" required />
      <button type="submit">Entrar</button>
    </form>
    <p>Perdeu a sua palavra-passe? <a href="#">Recuperar palavra-passe</a></p>
    <p>Não conseguiu ativar a sua conta através do email de validação? <a href="#">Reenviar email</a></p>
  `));
}

function renderRegisto({ success } = {}) {
  if (success) {
    return layout('Registar', authShell(`
      <div class="confirmation">
        <div class="check-icon" role="status">&check;</div>
        <p>As instruções de confirmação foram enviadas para o seu email.</p>
        <p>Por favor verrifique a sua caixa de entrada e/ou pasta de Spam</p>
        <p><a href="/login">Voltar à pagina principal</a></p>
      </div>
    `));
  }
  return layout('Registar', authShell(`
    <h2>Registar</h2>
    <form method="post" action="/registo">
      <div class="row-2">
        <div>
          <label for="entidade">Nome da Entidade *</label>
          <input type="text" id="entidade" name="entidade" required />
        </div>
        <div>
          <label for="nif">NIF *</label>
          <input type="text" id="nif" name="nif" required />
        </div>
      </div>
      <label for="email">Endereço de e-mail *</label>
      <input type="email" id="email" name="email" required />
      <div class="row-2">
        <div>
          <label for="password">Palavra-passe *</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label for="confirmPassword">Confirmar palavra-passe *</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />
        </div>
      </div>
      <button type="submit">Registar</button>
    </form>
    <p>Já tem conta? <a href="/login">Entre aqui</a></p>
  `));
}

function documentRow(index, atcudValue = '') {
  return `
    <div class="document-row" data-row>
      <input type="file" name="documentos" required />
      <input type="text" name="atcud" placeholder="ATCUD" value="${escapeHtml(atcudValue)}" />
      ${index === 0 ? '<button type="button" class="add-row" title="Adicionar documento">+</button>' : '<button type="button" class="remove-row" title="Remover">&minus;</button>'}
    </div>`;
}

function itineraryField(label, prefix, values) {
  const local = values?.[`${prefix}Local`] || '';
  const date = values?.[`${prefix}Date`] || '';
  const time = values?.[`${prefix}Time`] || '';
  return `
    <div class="itinerary-pair">
      <div>
        <label for="${prefix}Local">Local de ${label} *</label>
        <input type="text" id="${prefix}Local" name="${prefix}Local" value="${escapeHtml(local)}" required />
      </div>
      <div class="datetime-pair">
        <label>Data/Hora de ${label} *</label>
        <span class="datetime-inputs">
          <span class="icon-field">📅 <input type="date" name="${prefix}Date" value="${escapeHtml(date)}" required /></span>
          <span class="icon-field">🕐 <input type="time" name="${prefix}Time" value="${escapeHtml(time)}" required /></span>
        </span>
      </div>
    </div>`;
}

function wizardHtml({ error, formValues } = {}) {
  const v = formValues || {};
  return `
  <section id="novo-registo-panel" class="tab-panel">
    <div class="wizard-steps">
      <span class="step active" data-step="1">1 Matrícula</span> &rarr;
      <span class="step" data-step="2">2 Itinerário</span> &rarr;
      <span class="step" data-step="3">3 Documentação</span>
    </div>
    ${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
    <form id="wizard-form" method="post" action="/app/novo-registo/submit" enctype="multipart/form-data">
      <div class="wizard-step" data-step-panel="1">
        <div class="itinerary-pair">
          <div>
            <label for="plateCountry">País da Matrícula *</label>
            <input type="text" id="plateCountry" name="plateCountry" value="🇵🇹 Portugal" disabled />
            <input type="hidden" name="plateCountry" value="Portugal" />
          </div>
          <div>
            <label for="plate">Matrícula *</label>
            <input type="text" id="plate" name="plate" value="${escapeHtml(v.plate)}" required />
          </div>
        </div>
        <button type="button" class="next-step">Seguinte &rarr;</button>
      </div>

      <div class="wizard-step" data-step-panel="2" hidden>
        ${itineraryField('Origem', 'origem', v)}
        ${itineraryField('Carga', 'carga', v)}
        ${itineraryField('Descarga', 'descarga', v)}
        ${itineraryField('Destino', 'destino', v)}
        <button type="button" class="prev-step">&larr; Anterior</button>
        <button type="button" class="next-step">Seguinte &rarr;</button>
      </div>

      <div class="wizard-step" data-step-panel="3" hidden>
        <label>Documentos de Transporte *</label>
        <div id="document-rows">${documentRow(0)}</div>
        <p class="hint">Consideram-se documentos de transporte a fatura, a guia de remessa, a guia de transporte e a nota de devolução.</p>
        <button type="button" class="prev-step">&larr; Anterior</button>
        <button type="submit">Concluir</button>
      </div>
    </form>
  </section>`;
}

function confirmationHtml(code) {
  return `
  <section id="confirmacao-panel" class="tab-panel">
    <div class="confirmation">
      <h2>Pedido <strong>${escapeHtml(code)}</strong> registado.</h2>
      <div class="check-icon" role="status">&check;</div>
      <p>As instruções de confirmação foram enviadas para o seu email.</p>
      <p>Por favor verrifique a sua caixa de entrada e/ou pasta de Spam</p>
      <p><a href="/app?tab=novo-registo">Voltar à pagina principal</a></p>
    </div>
  </section>`;
}

function tableRow(r) {
  const submitted = new Date(r.submittedAt);
  const data = submitted.toLocaleDateString('pt-PT');
  const hora = submitted.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  return `
    <tr data-code="${escapeHtml(r.requestCode)}">
      <td>${data}</td>
      <td>${hora}</td>
      <td>${escapeHtml(r.requestCode)}</td>
      <td>${escapeHtml(r.plate)}</td>
      <td>${escapeHtml(r.origemLocal)}</td>
      <td>${escapeHtml(r.originDateTimeDisplay)}</td>
      <td>${escapeHtml(r.destinoLocal)}</td>
      <td>${escapeHtml(r.destinoDateTimeDisplay)}</td>
      <td class="row-actions">
        <button type="button" class="view-row" title="Ver">📄</button>
        <button type="button" class="edit-row" title="Editar" disabled>✏️</button>
        <button type="button" class="delete-row" title="Apagar" disabled>🗑️</button>
      </td>
    </tr>`;
}

function registosSubmetidosHtml(records) {
  return `
  <section id="registos-submetidos-panel" class="tab-panel">
    <div class="table-toolbar">Colunas | Filtros | Atualizar</div>
    <table>
      <thead>
        <tr>
          <th>Data</th><th>Hora</th><th>Código</th><th>Matrícula</th>
          <th>Origem</th><th>Data/Hora Origem</th><th>Destino</th><th>Data/Hora Destino</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${records.length ? records.map(tableRow).join('') : '<tr><td colspan="9" class="muted">Sem registos submetidos.</td></tr>'}
      </tbody>
    </table>
    <p class="muted">1&ndash;${records.length} de ${records.length}</p>
    <div id="detail-modal" class="modal" hidden>
      <div class="modal-content">
        <button type="button" class="modal-close" title="Fechar">&times;</button>
        <div class="modal-tabs">
          <span class="modal-tab active" data-modal-tab="registo">Registo</span>
          <span class="modal-tab" data-modal-tab="itinerario">Itinerário</span>
          <span class="modal-tab" data-modal-tab="documentacao">Documentação</span>
        </div>
        <div id="modal-body"></div>
      </div>
    </div>
  </section>`;
}

function renderAppShell({ user, activeTab, wizardError, formValues, confirmado, records }) {
  const novoRegistoContent = confirmado ? confirmationHtml(confirmado) : wizardHtml({ error: wizardError, formValues });
  return layout('Novo Registo', `
  <header class="app-header">
    <div>
      <h1>SIGA-VP</h1>
      <p>Gestão da circulação de veiculos pesados de mercadorias</p>
    </div>
    <div class="app-header-user">
      <span>Português &#9662;</span>
      <span class="avatar">${escapeHtml((user.email || '?')[0].toUpperCase())}</span>
      <span class="user-info">, ${escapeHtml(user.name || 'Utilizador')}<br/>${escapeHtml(user.email)}<br/><em>Empresa</em></span>
    </div>
  </header>
  <nav class="tabs">
    <button type="button" class="tab-btn ${activeTab !== 'registos-submetidos' ? 'active' : ''}" data-tab="novo-registo">📄 NOVO REGISTO</button>
    <button type="button" class="tab-btn ${activeTab === 'registos-submetidos' ? 'active' : ''}" data-tab="registos-submetidos">📅 REGISTOS SUBMETIDOS</button>
    <form method="post" action="/logout" class="logout-form"><button type="submit">Sair</button></form>
  </nav>
  <main class="app-main">
    <div id="novo-registo-wrap" ${activeTab === 'registos-submetidos' ? 'hidden' : ''}>${novoRegistoContent}</div>
    <div id="registos-submetidos-wrap" ${activeTab === 'registos-submetidos' ? '' : 'hidden'}>${registosSubmetidosHtml(records)}</div>
  </main>
  <script src="/js/app.js"></script>
  `);
}

module.exports = { renderLogin, renderRegisto, renderAppShell };
