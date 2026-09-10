(function wizardSteps() {
  const form = document.getElementById('wizard-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.wizard-step'));
  const stepLabels = Array.from(document.querySelectorAll('.wizard-steps .step'));
  let current = 0;

  function showStep(index) {
    steps.forEach((step, i) => { step.hidden = i !== index; });
    stepLabels.forEach((label, i) => label.classList.toggle('active', i === index));
    current = index;
  }

  function currentStepValid() {
    const inputs = steps[current].querySelectorAll('input[required]');
    for (const input of inputs) {
      if (!input.reportValidity()) return false;
    }
    return true;
  }

  form.querySelectorAll('.next-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentStepValid()) showStep(current + 1);
    });
  });

  form.querySelectorAll('.prev-step').forEach((btn) => {
    btn.addEventListener('click', () => showStep(current - 1));
  });

  const rowsContainer = document.getElementById('document-rows');
  if (rowsContainer) {
    rowsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-row')) {
        const row = rowsContainer.firstElementChild.cloneNode(true);
        row.querySelector('input[type="file"]').value = '';
        row.querySelector('input[type="text"]').value = '';
        const addBtn = row.querySelector('.add-row');
        if (addBtn) {
          addBtn.textContent = '−';
          addBtn.classList.remove('add-row');
          addBtn.classList.add('remove-row');
          addBtn.title = 'Remover';
        }
        rowsContainer.appendChild(row);
      } else if (e.target.classList.contains('remove-row')) {
        e.target.closest('.document-row').remove();
      }
    });
  }
})();

(function tabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const novoRegistoWrap = document.getElementById('novo-registo-wrap');
  const registosWrap = document.getElementById('registos-submetidos-wrap');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isRegistos = btn.dataset.tab === 'registos-submetidos';
      novoRegistoWrap.hidden = isRegistos;
      registosWrap.hidden = !isRegistos;
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      const url = new URL(window.location.href);
      url.searchParams.set('tab', btn.dataset.tab);
      window.history.replaceState({}, '', url);
    });
  });
})();

(function detailModal() {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  const modalBody = document.getElementById('modal-body');
  const modalTabs = modal.querySelectorAll('.modal-tab');

  function renderTab(record, tab) {
    if (tab === 'registo') {
      return `
        <div class="itinerary-pair">
          <div><label>Matrícula</label><div>${record.plate}</div></div>
          <div><label>País da Matrícula</label><div>${record.plateCountry}</div></div>
        </div>
        <div class="itinerary-pair">
          <div><label>Código</label><div>${record.requestCode}</div></div>
          <div><label>Data/Hora</label><div>${record.originDateTimeDisplay}</div></div>
        </div>`;
    }
    if (tab === 'itinerario') {
      return `
        <div class="itinerary-pair">
          <div><label>Origem</label><div>${record.origemLocal}</div></div>
          <div><label>Data/Hora de Origem</label><div>${record.originDateTimeDisplay}</div></div>
        </div>
        <div class="itinerary-pair">
          <div><label>Local de Carga</label><div>${record.cargaLocal}</div></div>
          <div><label>Data/Hora de Carga</label><div>${record.cargaDate} ${record.cargaTime}</div></div>
        </div>
        <div class="itinerary-pair">
          <div><label>Local de Descarga</label><div>${record.descargaLocal}</div></div>
          <div><label>Data/Hora de Descarga</label><div>${record.descargaDate} ${record.descargaTime}</div></div>
        </div>
        <div class="itinerary-pair">
          <div><label>Destino</label><div>${record.destinoLocal}</div></div>
          <div><label>Data/Hora de Destino</label><div>${record.destinoDateTimeDisplay}</div></div>
        </div>`;
    }
    return `<ul>${record.documents.map((d) => `<li>${d.filename}${d.atcud ? ` — ATCUD: ${d.atcud}` : ''}</li>`).join('')}</ul>`;
  }

  let currentRecord = null;

  function openModal(record) {
    currentRecord = record;
    modalTabs.forEach((t, i) => t.classList.toggle('active', i === 0));
    modalBody.innerHTML = renderTab(record, 'registo');
    modal.hidden = false;
  }

  modalTabs.forEach((tabEl) => {
    tabEl.addEventListener('click', () => {
      modalTabs.forEach((t) => t.classList.remove('active'));
      tabEl.classList.add('active');
      modalBody.innerHTML = renderTab(currentRecord, tabEl.dataset.modalTab);
    });
  });

  modal.querySelector('.modal-close').addEventListener('click', () => { modal.hidden = true; });

  document.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('view-row')) return;
    const code = e.target.closest('tr').dataset.code;
    const res = await fetch(`/app/registos-submetidos/${encodeURIComponent(code)}/detalhe`);
    if (!res.ok) return;
    openModal(await res.json());
  });
})();
