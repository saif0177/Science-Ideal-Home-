/* Science Ideal Home — App Script (Vanilla JS, localStorage) */
(function () {
  'use strict';

  const STORAGE_KEY = 'scienceIdealHome.v1';

  const selectors = {
    tabs: '.tabs .tab',
    screens: '.screen',
    studentsList: '#students-list',
    staffExpenseList: '#staffexpense-list',
    studentSearch: '#student-search',
    chip: '.chip',
    btnAddStudent: '#btn-add-student',
    btnAddStaffExpense: '#btn-add-staffexpense',
    studentFormModal: '#modal-student-form',
    studentForm: '#student-form',
    paymentFormModal: '#modal-payment-form',
    paymentForm: '#payment-form',
    noticeModal: '#modal-notice',
    calculatorModal: '#modal-calculator',
    receipt: '#receipt',
  };

  const appState = {
    data: { students: [], payments: [], staffExpenses: [] },
    filters: { status: null, pay: null, search: '' },
    selectedStudentId: null,
  };

  // Utilities
  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        appState.data = {
          students: Array.isArray(parsed.students) ? parsed.students : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          staffExpenses: Array.isArray(parsed.staffExpenses) ? parsed.staffExpenses : [],
        };
        return;
      }
    } catch (_) { /* ignore */ }
    appState.data = { students: [], payments: [], staffExpenses: [] };
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.data));
  }

  function ensureSeedData() {
    if (appState.data.students.length > 0 || appState.data.staffExpenses.length > 0) return;

    const student1 = {
      id: generateId('stu'),
      name: 'Ahsan Khan',
      roll: '102',
      classGroup: '10 Science',
      phone: '+8801711000001',
      phone2: '',
      studentId: 'SID-001',
      fatherName: 'Rahim Khan',
      fatherPhone1: '+8801711000002',
      fatherPhone2: '',
      fatherJob: 'Engineer',
      address: 'Chittagong, BD',
      details: 'Excellent in Physics and Math',
      status: 'present',
      photo: '',
      createdAt: new Date().toISOString(),
    };
    const student2 = {
      id: generateId('stu'),
      name: 'Maya Rahman',
      roll: '215',
      classGroup: '9 Arts',
      phone: '+8801711000033',
      phone2: '',
      studentId: 'SID-002',
      fatherName: 'Karim Rahman',
      fatherPhone1: '+8801711000044',
      fatherPhone2: '',
      fatherJob: 'Teacher',
      address: 'Dhaka, BD',
      details: 'Transferred to another hostel',
      status: 'ex',
      photo: '',
      createdAt: new Date().toISOString(),
    };

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const payment1 = {
      id: generateId('pay'),
      studentId: student1.id,
      month: currentMonth,
      apartment: 1500,
      tuition: 1200,
      foodDays: 20,
      foodRate: 80,
      foodTotal: 1600,
      total: 1500 + 1200 + 1600,
      createdAt: new Date().toISOString(),
    };

    const staffSalary = {
      id: generateId('se'),
      type: 'staff',
      status: 'paid',
      title: 'Warden Salary',
      desc: 'Monthly salary for Hostel Warden',
      amount: 15000,
      phone: '+8801711223344',
      createdAt: new Date().toISOString(),
    };

    const expense = {
      id: generateId('se'),
      type: 'expense',
      status: 'not_paid',
      title: 'Electricity Bill',
      desc: 'September billing',
      amount: 7800,
      phone: '',
      createdAt: new Date().toISOString(),
    };

    appState.data.students.push(student1, student2);
    appState.data.payments.push(payment1);
    appState.data.staffExpenses.push(staffSalary, expense);
    saveData();
  }

  // Format helpers
  function formatCurrency(n) {
    const num = Number(n || 0);
    return `৳${num.toLocaleString('en-BD')}`;
  }

  function monthDisplay(yyyyMm) {
    try {
      const [y, m] = yyyyMm.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    } catch (_) {
      return yyyyMm;
    }
  }

  function isPaidForMonth(studentId, yyyyMm) {
    return appState.data.payments.some(p => p.studentId === studentId && p.month === yyyyMm);
  }

  // Routing
  function setActiveTab(route) {
    document.querySelectorAll(selectors.tabs).forEach(btn => {
      const isActive = btn.dataset.route === route;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  }

  function showScreen(route) {
    let handled = false;
    if (route === 'calculator') {
      openModal('modal-calculator');
      handled = true;
    }

    document.querySelectorAll(selectors.screens).forEach(sec => {
      const match = sec.dataset.screen === route;
      sec.toggleAttribute('hidden', !match);
    });

    if (!handled) setActiveTab(route);
    refreshIcons();
  }

  // Icons
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Modals & Panels
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.removeAttribute('hidden');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('hidden', '');
  }

  function openPanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.removeAttribute('hidden');
    el.setAttribute('aria-hidden', 'false');
  }

  function closePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
  }

  // Students UI
  function applyStudentFilters(students) {
    const q = (appState.filters.search || '').trim().toLowerCase();
    const status = appState.filters.status; // 'present' | 'ex' | null
    const pay = appState.filters.pay; // 'complete' | 'pending' | null

    const currentMonth = new Date().toISOString().slice(0, 7);

    return students.filter(s => {
      if (q) {
        const hay = `${s.name} ${s.roll || ''} ${s.studentId || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status && s.status !== status) return false;
      if (pay) {
        const paid = isPaidForMonth(s.id, currentMonth);
        if (pay === 'complete' && !paid) return false;
        if (pay === 'pending' && paid) return false;
      }
      return true;
    });
  }

  function renderStudentsList() {
    const container = document.querySelector(selectors.studentsList);
    if (!container) return;
    container.innerHTML = '';

    const students = applyStudentFilters(appState.data.students);
    const currentMonth = new Date().toISOString().slice(0, 7);

    if (students.length === 0) {
      container.innerHTML = `
        <div class="card placeholder">
          <div class="placeholder-icon">🔍</div>
          <div class="placeholder-title">No students match</div>
          <p class="placeholder-text">Try adjusting search or filters.</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    const frag = document.createDocumentFragment();
    students.forEach(s => {
      const paid = isPaidForMonth(s.id, currentMonth);
      const item = document.createElement('div');
      item.className = 'item';
      item.dataset.id = s.id;
      item.innerHTML = `
        <img class="avatar" alt="${escapeHtml(s.name)}" src="${s.photo || ''}" onerror="this.src='';this.style.background='#e5e7eb'" />
        <div>
          <div class="item-title">${escapeHtml(s.name)}</div>
          <div class="item-sub">Roll ${escapeHtml(s.roll || '-')}, ${escapeHtml(s.classGroup || '-')}</div>
          <div class="badges">
            <span class="badge ${s.status === 'present' ? 'green' : ''}">${s.status === 'present' ? 'Present' : 'Ex-student'}</span>
            <span class="badge ${paid ? 'green' : 'red'}">${paid ? 'Paid' : 'Unpaid'}</span>
          </div>
        </div>
        <button class="icon-btn" title="Open Profile" aria-label="Open Profile">
          <i data-lucide="chevron-right" class="icon"></i>
        </button>
      `;
      item.addEventListener('click', () => openStudentProfile(s.id));
      frag.appendChild(item);
    });

    container.appendChild(frag);
    refreshIcons();
  }

  function openStudentProfile(studentId) {
    appState.selectedStudentId = studentId;
    const s = appState.data.students.find(x => x.id === studentId);
    if (!s) return;

    const photo = document.getElementById('profile-photo');
    const name = document.getElementById('profile-name');
    const meta = document.getElementById('profile-meta');
    const tags = document.getElementById('profile-tags');

    const fatherName = document.getElementById('profile-father-name');
    const fatherJob = document.getElementById('profile-father-job');
    const phone = document.getElementById('profile-phone');
    const address = document.getElementById('profile-address');
    const more = document.getElementById('profile-more');

    photo.src = s.photo || '';
    name.textContent = s.name;
    meta.textContent = `Roll ${s.roll || '-'} • ${s.classGroup || '-'}`;
    tags.innerHTML = `
      <span class="badge ${s.status === 'present' ? 'green' : ''}">${s.status === 'present' ? 'Present' : 'Ex-student'}</span>
    `;

    fatherName.textContent = s.fatherName || '-';
    fatherJob.textContent = s.fatherJob || '-';
    phone.textContent = [s.phone, s.phone2].filter(Boolean).join(', ') || '-';
    address.textContent = s.address || '-';
    more.textContent = s.details || '-';

    renderPaymentHistory(studentId);
    openPanel('panel-student-profile');
    refreshIcons();
  }

  function renderPaymentHistory(studentId) {
    const container = document.getElementById('profile-payments');
    const records = appState.data.payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => (a.month < b.month ? 1 : -1));

    if (records.length === 0) {
      container.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🧾</div>
          <div class="placeholder-title">No Payments Yet</div>
          <p class="placeholder-text">Payments will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    const frag = document.createDocumentFragment();

    records.forEach(p => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div><strong>${monthDisplay(p.month)}</strong></div>
        <div>${formatCurrency(p.apartment)}</div>
        <div>${formatCurrency(p.tuition + (p.foodTotal || 0))}</div>
        <div><strong>${formatCurrency(p.total)}</strong></div>
      `;
      frag.appendChild(row);
    });

    container.appendChild(frag);
  }

  // Staff/Expense UI
  function renderStaffExpenseList() {
    const container = document.querySelector(selectors.staffExpenseList);
    if (!container) return;
    container.innerHTML = '';

    if (appState.data.staffExpenses.length === 0) {
      container.innerHTML = `
        <div class="card placeholder">
          <div class="placeholder-icon">📦</div>
          <div class="placeholder-title">No entries yet</div>
          <p class="placeholder-text">Use Add Entry to create staff salary or expense.</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    appState.data.staffExpenses
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = entry.id;
        card.innerHTML = `
          <div class="card-title">${escapeHtml(entry.title)} <span class="badge ${entry.status === 'paid' ? 'green' : 'red'}" style="margin-left:8px">${entry.status === 'paid' ? 'Paid' : 'Not Paid'}</span></div>
          <div class="item-sub" style="margin-bottom:8px">${escapeHtml(entry.desc || '')}</div>
          <div class="kv">
            <div><span>Type</span><strong>${entry.type === 'staff' ? 'Staff Salary' : 'Expense'}</strong></div>
            <div><span>Amount</span><strong>${formatCurrency(entry.amount)}</strong></div>
            <div><span>Phone</span><strong>${escapeHtml(entry.phone || '-')}</strong></div>
            <div><span>Date</span><strong>${new Date(entry.createdAt).toLocaleDateString()}</strong></div>
          </div>
        `;
        card.addEventListener('click', () => openStaffExpenseForEdit(entry.id));
        frag.appendChild(card);
      });
    container.appendChild(frag);
    refreshIcons();
  }

  // Forms — Student
  function resetStudentForm() {
    const form = document.querySelector(selectors.studentForm);
    form.reset();
    form.querySelector('#student-id').value = '';
    const preview = document.getElementById('student-photo-preview');
    if (preview) preview.src = '';
  }

  function fillStudentForm(student) {
    const form = document.querySelector(selectors.studentForm);
    form.querySelector('#student-id').value = student.id;
    document.getElementById('student-name').value = student.name || '';
    document.getElementById('student-roll').value = student.roll || '';
    document.getElementById('student-class').value = student.classGroup || '';
    document.getElementById('student-phone').value = student.phone || '';
    document.getElementById('student-phone2').value = student.phone2 || '';
    document.getElementById('student-studentId').value = student.studentId || '';
    document.getElementById('student-fatherName').value = student.fatherName || '';
    document.getElementById('student-fatherPhone1').value = student.fatherPhone1 || '';
    document.getElementById('student-fatherPhone2').value = student.fatherPhone2 || '';
    document.getElementById('student-fatherJob').value = student.fatherJob || '';
    document.getElementById('student-address').value = student.address || '';
    document.getElementById('student-details').value = student.details || '';
    document.getElementById('student-status').value = student.status || 'present';
    const preview = document.getElementById('student-photo-preview');
    preview.src = student.photo || '';
  }

  function gatherStudentFormValues() {
    return {
      id: document.getElementById('student-id').value || generateId('stu'),
      name: document.getElementById('student-name').value.trim(),
      roll: document.getElementById('student-roll').value.trim(),
      classGroup: document.getElementById('student-class').value.trim(),
      phone: document.getElementById('student-phone').value.trim(),
      phone2: document.getElementById('student-phone2').value.trim(),
      studentId: document.getElementById('student-studentId').value.trim(),
      fatherName: document.getElementById('student-fatherName').value.trim(),
      fatherPhone1: document.getElementById('student-fatherPhone1').value.trim(),
      fatherPhone2: document.getElementById('student-fatherPhone2').value.trim(),
      fatherJob: document.getElementById('student-fatherJob').value.trim(),
      address: document.getElementById('student-address').value.trim(),
      details: document.getElementById('student-details').value.trim(),
      status: document.getElementById('student-status').value,
      photo: document.getElementById('student-photo-preview').src || '',
      createdAt: new Date().toISOString(),
    };
  }

  function handleStudentPhotoPreview() {
    const input = document.getElementById('student-photo');
    const preview = document.getElementById('student-photo-preview');
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => { preview.src = String(e.target.result || ''); };
      reader.readAsDataURL(file);
    });
  }

  function onSubmitStudentForm(e) {
    e.preventDefault();
    const values = gatherStudentFormValues();
    const idx = appState.data.students.findIndex(s => s.id === values.id);
    if (idx >= 0) {
      appState.data.students[idx] = { ...appState.data.students[idx], ...values };
    } else {
      appState.data.students.push(values);
    }
    saveData();
    closeModal('modal-student-form');
    renderStudentsList();
    if (appState.selectedStudentId === values.id) {
      openStudentProfile(values.id);
    }
  }

  // Payment
  function recalcPaymentTotals() {
    const apt = parseFloat(document.getElementById('payment-apartment').value || '0') || 0;
    const tuition = parseFloat(document.getElementById('payment-tuition').value || '0') || 0;
    const days = parseFloat(document.getElementById('payment-food-days').value || '0') || 0;
    const rate = parseFloat(document.getElementById('payment-food-rate').value || '0') || 0;
    const food = days * rate;
    const total = apt + tuition + food;
    document.getElementById('payment-food-total').value = String(food);
    document.getElementById('payment-total').value = String(total);
  }

  function openPaymentForm(studentId) {
    const s = appState.data.students.find(x => x.id === studentId);
    if (!s) return;
    document.getElementById('payment-student-id').value = s.id;
    document.getElementById('payment-month').value = new Date().toISOString().slice(0, 7);
    document.getElementById('payment-apartment').value = '0';
    document.getElementById('payment-tuition').value = '0';
    document.getElementById('payment-food-days').value = '0';
    document.getElementById('payment-food-rate').value = '0';
    document.getElementById('payment-food-total').value = '0';
    document.getElementById('payment-total').value = '0';
    openModal('modal-payment-form');
  }

  function onSubmitPaymentForm(e) {
    e.preventDefault();
    const studentId = document.getElementById('payment-student-id').value;
    if (!studentId) return;
    const month = document.getElementById('payment-month').value;
    const apartment = parseFloat(document.getElementById('payment-apartment').value || '0') || 0;
    const tuition = parseFloat(document.getElementById('payment-tuition').value || '0') || 0;
    const foodDays = parseFloat(document.getElementById('payment-food-days').value || '0') || 0;
    const foodRate = parseFloat(document.getElementById('payment-food-rate').value || '0') || 0;
    const foodTotal = foodDays * foodRate;
    const total = apartment + tuition + foodTotal;

    const record = {
      id: generateId('pay'),
      studentId,
      month,
      apartment,
      tuition,
      foodDays,
      foodRate,
      foodTotal,
      total,
      createdAt: new Date().toISOString(),
    };
    appState.data.payments.push(record);
    saveData();

    closeModal('modal-payment-form');
    if (appState.selectedStudentId === studentId) {
      renderPaymentHistory(studentId);
      openStudentProfile(studentId);
    }
    renderStudentsList();
  }

  function printReceiptFromForm() {
    const studentId = document.getElementById('payment-student-id').value;
    const s = appState.data.students.find(x => x.id === studentId);
    const month = document.getElementById('payment-month').value;
    const apt = parseFloat(document.getElementById('payment-apartment').value || '0') || 0;
    const tuition = parseFloat(document.getElementById('payment-tuition').value || '0') || 0;
    const foodDays = parseFloat(document.getElementById('payment-food-days').value || '0') || 0;
    const foodRate = parseFloat(document.getElementById('payment-food-rate').value || '0') || 0;
    const food = foodDays * foodRate;
    const total = apt + tuition + food;

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${s ? escapeHtml(s.name) : ''}</title>
        <style>
          body { font-family: Inter, system-ui, Arial; padding: 20px; }
          .receipt { max-width: 420px; margin: 0 auto; }
          .h { text-align: center; margin-bottom: 16px; }
          .h .t1 { font-weight: 800; font-size: 18px; }
          .h .t2 { color: #334155; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          td { padding: 6px 0; }
          .r td { border-top: 1px dashed #cbd5e1; }
          .tot td { border-top: 2px solid #0f172a; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="h">
            <div class="t1">Science Ideal Home</div>
            <div class="t2">Hostel Management Receipt</div>
          </div>
          <div>Student: <strong>${s ? escapeHtml(s.name) : '-'}</strong></div>
          <div>Month: <strong>${escapeHtml(monthDisplay(month))}</strong></div>
          <table>
            <tr><td>Apartment Bill</td><td style="text-align:right">${formatCurrency(apt)}</td></tr>
            <tr><td>Tuition Fee</td><td style="text-align:right">${formatCurrency(tuition)}</td></tr>
            <tr class="r"><td>Food (${foodDays} days × ${formatCurrency(foodRate)})</td><td style="text-align:right">${formatCurrency(food)}</td></tr>
            <tr class="tot"><td>Total</td><td style="text-align:right">${formatCurrency(total)}</td></tr>
          </table>
          <div style="margin-top:16px;font-size:12px;color:#334155">Powered by Science Ideal Home</div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); }<\/script>
      </body>
      </html>
    `;

    const w = window.open('', 'PRINT', 'height=650,width=480');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
    }
  }

  // Notice
  function openNoticeFor(phone, message) {
    document.getElementById('notice-phone').value = phone || '';
    document.getElementById('notice-message').value = message || '';
    updateNoticeLinks();
    openModal('modal-notice');
  }

  function updateNoticeLinks() {
    const phone = (document.getElementById('notice-phone').value || '').replace(/[^+\d]/g, '');
    const message = encodeURIComponent(document.getElementById('notice-message').value || '');
    const smsHref = phone ? `sms:${phone}?body=${message}` : '#';
    const waHref = phone ? `https://wa.me/${phone.replace(/^\+/, '')}?text=${message}` : '#';
    document.getElementById('notice-sms').setAttribute('href', smsHref);
    document.getElementById('notice-wa').setAttribute('href', waHref);
  }

  // Staff/Expense forms
  function resetStaffExpenseForm() {
    const form = document.getElementById('staffexpense-form');
    form.reset();
    document.getElementById('staffexpense-id').value = '';
    document.getElementById('staffexpense-type').value = 'staff';
    document.getElementById('staffexpense-status').value = 'not_paid';
  }

  function fillStaffExpenseForm(entry) {
    document.getElementById('staffexpense-id').value = entry.id;
    document.getElementById('staffexpense-type').value = entry.type;
    document.getElementById('staffexpense-status').value = entry.status;
    document.getElementById('staffexpense-title-input').value = entry.title || '';
    document.getElementById('staffexpense-desc').value = entry.desc || '';
    document.getElementById('staffexpense-amount').value = String(entry.amount || 0);
    document.getElementById('staffexpense-phone').value = entry.phone || '';
  }

  function openStaffExpenseForEdit(id) {
    const entry = appState.data.staffExpenses.find(e => e.id === id);
    if (!entry) return;
    fillStaffExpenseForm(entry);
    openModal('modal-staffexpense');
  }

  function onSubmitStaffExpenseForm(e) {
    e.preventDefault();
    const id = document.getElementById('staffexpense-id').value || generateId('se');
    const entry = {
      id,
      type: document.getElementById('staffexpense-type').value,
      status: document.getElementById('staffexpense-status').value,
      title: document.getElementById('staffexpense-title-input').value.trim(),
      desc: document.getElementById('staffexpense-desc').value.trim(),
      amount: parseFloat(document.getElementById('staffexpense-amount').value || '0') || 0,
      phone: document.getElementById('staffexpense-phone').value.trim(),
      createdAt: new Date().toISOString(),
    };

    const idx = appState.data.staffExpenses.findIndex(e2 => e2.id === id);
    if (idx >= 0) appState.data.staffExpenses[idx] = { ...appState.data.staffExpenses[idx], ...entry };
    else appState.data.staffExpenses.push(entry);

    saveData();
    renderStaffExpenseList();
    closeModal('modal-staffexpense');
  }

  // Calculator
  function setupCalculator() {
    const display = document.getElementById('calc-display');
    document.getElementById('modal-calculator').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-calc]');
      if (!btn) return;
      const v = btn.getAttribute('data-calc');
      if (v === 'C') {
        display.value = '';
        return;
      }
      if (v === '=') {
        try {
          const expr = sanitizeExpression(display.value);
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${expr})`)();
          display.value = String(result);
        } catch (_) {
          display.value = 'Error';
        }
        return;
      }
      display.value += v;
    });
  }

  function sanitizeExpression(expr) {
    // Allow digits, operators, decimal points, whitespace and parentheses
    const safe = expr.replace(/[^0-9+\-*/().\s]/g, '');
    return safe;
  }

  // Search & Filters
  function setupSearchAndFilters() {
    const search = document.querySelector(selectors.studentSearch);
    if (search) {
      search.addEventListener('input', () => {
        appState.filters.search = search.value;
        renderStudentsList();
      });
    }

    document.querySelectorAll(selectors.chip).forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.filter; // status | pay
        const value = chip.dataset.value; // present | ex | complete | pending
        const isActive = chip.classList.toggle('is-active');
        // Make chips in same filter mutually exclusive; clicking again unsets
        document.querySelectorAll(`.chip[data-filter="${type}"]`).forEach(other => {
          if (other !== chip) other.classList.remove('is-active');
        });
        appState.filters[type] = isActive ? value : null;
        renderStudentsList();
      });
    });
  }

  // Event wiring
  function setupEvents() {
    // Tabs
    document.querySelectorAll(selectors.tabs).forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        if (route === 'calculator') {
          openModal('modal-calculator');
          return;
        }
        showScreen(route);
      });
    });

    // Panel close
    document.body.addEventListener('click', (e) => {
      const closePanelBtn = e.target.closest('[data-close-panel]');
      if (closePanelBtn) {
        const id = closePanelBtn.getAttribute('data-close-panel');
        closePanel(id);
      }
      const closeModalBtn = e.target.closest('[data-close-modal]');
      if (closeModalBtn) {
        const id = closeModalBtn.getAttribute('data-close-modal');
        closeModal(id);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close top-most open modal/panel
        const openModals = Array.from(document.querySelectorAll('.modal:not([hidden])'));
        if (openModals.length) {
          const top = openModals[openModals.length - 1];
          top.setAttribute('hidden', '');
          return;
        }
        const openPanels = Array.from(document.querySelectorAll('.panel:not([hidden])'));
        if (openPanels.length) {
          const top = openPanels[openPanels.length - 1];
          top.setAttribute('hidden', '');
        }
      }
    });

    // Students
    const addStudentBtn = document.querySelector(selectors.btnAddStudent);
    if (addStudentBtn) {
      addStudentBtn.addEventListener('click', () => {
        resetStudentForm();
        openModal('modal-student-form');
      });
    }

    handleStudentPhotoPreview();

    document.getElementById('student-phone-wa').addEventListener('click', () => {
      const phone = (document.getElementById('student-phone').value || '').replace(/[^+\d]/g, '');
      if (!phone) return;
      window.open(`https://wa.me/${phone.replace(/^\+/, '')}`,'_blank');
    });
    document.getElementById('student-fatherPhone1-wa').addEventListener('click', () => {
      const phone = (document.getElementById('student-fatherPhone1').value || '').replace(/[^+\d]/g, '');
      if (!phone) return;
      window.open(`https://wa.me/${phone.replace(/^\+/, '')}`,'_blank');
    });

    document.querySelector(selectors.studentForm).addEventListener('submit', onSubmitStudentForm);

    // Payment
    ['payment-apartment','payment-tuition','payment-food-days','payment-food-rate']
      .forEach(id => document.getElementById(id).addEventListener('input', recalcPaymentTotals));

    document.querySelector(selectors.paymentForm).addEventListener('submit', onSubmitPaymentForm);
    document.getElementById('btn-print-receipt').addEventListener('click', printReceiptFromForm);

    // Notice
    document.getElementById('notice-phone').addEventListener('input', updateNoticeLinks);
    document.getElementById('notice-message').addEventListener('input', updateNoticeLinks);

    document.getElementById('btn-profile-notice').addEventListener('click', () => {
      const s = appState.data.students.find(x => x.id === appState.selectedStudentId);
      if (!s) return;
      const currentMonth = new Date().toISOString().slice(0,7);
      const msg = `Dear Guardian, payment for ${monthDisplay(currentMonth)} is pending. Please clear dues.`;
      const to = (s.phone || s.fatherPhone1 || '').replace(/[^+\d]/g, '');
      openNoticeFor(to, msg);
    });

    document.getElementById('btn-profile-payment').addEventListener('click', () => {
      if (appState.selectedStudentId) openPaymentForm(appState.selectedStudentId);
    });

    document.getElementById('btn-profile-edit').addEventListener('click', () => {
      const s = appState.data.students.find(x => x.id === appState.selectedStudentId);
      if (!s) return;
      resetStudentForm();
      fillStudentForm(s);
      openModal('modal-student-form');
    });

    // Staff/Expense
    const addSE = document.querySelector(selectors.btnAddStaffExpense);
    if (addSE) addSE.addEventListener('click', () => { resetStaffExpenseForm(); openModal('modal-staffexpense'); });

    document.getElementById('staffexpense-form').addEventListener('submit', onSubmitStaffExpenseForm);

    // Dashboard: add export placeholder button (disabled)
    const syncBtn = document.getElementById('btn-sync-drive');
    if (syncBtn && !document.getElementById('btn-export-data')) {
      const exportBtn = document.createElement('button');
      exportBtn.id = 'btn-export-data';
      exportBtn.className = 'btn btn-outline';
      exportBtn.disabled = true;
      exportBtn.innerHTML = '<i data-lucide="download" class="icon"></i><span>Export Data (Coming Soon)</span>';
      syncBtn.parentElement.appendChild(document.createTextNode(' '));
      syncBtn.parentElement.appendChild(exportBtn);
    }
  }

  // Escape for HTML insertion
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Init
  function init() {
    loadData();
    ensureSeedData();
    setupEvents();
    setupSearchAndFilters();
    setupCalculator();

    // Initial render
    renderStudentsList();
    renderStaffExpenseList();

    // Default route
    showScreen('dashboard');

    refreshIcons();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
