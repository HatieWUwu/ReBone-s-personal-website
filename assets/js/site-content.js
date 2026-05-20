async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

async function loadText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.text();
}

async function loadLocalizedJson(fileName) {
  if (window.ReBoneI18n?.loadJson) return window.ReBoneI18n.loadJson(fileName);
  return loadJson(`content/zh/${fileName}`);
}

async function loadLocalizedText(fileName) {
  if (window.ReBoneI18n?.loadText) return window.ReBoneI18n.loadText(fileName);
  return loadText(`content/zh/${fileName}`);
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function isEnglishLang() {
  return window.ReBoneI18n?.getCurrentLang?.() === 'en';
}

function applyEnglishReadingMode(root, { article = false } = {}) {
  if (!root || !isEnglishLang()) return;

  if (article) root.classList.add('english-reading-article');

  root.querySelectorAll('p').forEach((el) => {
    if (el.classList.contains('text-xs') || el.classList.contains('text-sm')) return;
    el.classList.add('english-reading-body');
  });

  root.querySelectorAll('li').forEach((el) => {
    el.classList.add('english-reading-list');
  });

  root.querySelectorAll('blockquote').forEach((el) => {
    el.classList.add('english-reading-quote');
  });

  root.querySelectorAll('code').forEach((el) => {
    el.classList.add('english-reading-code');
  });

  root.querySelectorAll('h1, h2, h3, h4').forEach((el) => {
    el.classList.add('english-reading-heading');
  });

  root.querySelectorAll('h1').forEach((el) => {
    el.classList.add('english-reading-display');
  });

  root.querySelectorAll('h2').forEach((el) => {
    el.classList.add('english-reading-section-title');
  });

  root.querySelectorAll('h3, h4').forEach((el) => {
    el.classList.add('english-reading-subtitle');
  });
}

function appendParagraphs(parent, paragraphs, className = 'text-gray-700') {
  for (const paragraph of paragraphs || []) {
    parent.appendChild(createElement('p', className, paragraph));
  }
}

function appendList(parent, items, { ordered = false, className = 'space-y-2 text-sm text-gray-700 list-disc list-inside' } = {}) {
  const list = createElement(ordered ? 'ol' : 'ul', className);
  for (const item of items || []) {
    list.appendChild(createElement('li', '', item));
  }
  parent.appendChild(list);
  return list;
}

function sectionAnchorId(title) {
  return `card-${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item'}`;
}

function renderHomeRail(home) {
  const railRoot = document.getElementById('home-rail');
  if (!railRoot) return;
  railRoot.innerHTML = '';

  const menuLabel = home.rail?.menu_label || (isEnglishLang() ? 'Contents' : '内容');
  railRoot.appendChild(createElement('p', 'rail-label', menuLabel));
  const menu = createElement('nav', 'rail-nav');
  for (const item of home.sections || []) {
    const a = createElement('a', '', item.title);
    a.href = `#${sectionAnchorId(item.title)}`;
    menu.appendChild(a);
  }
  railRoot.appendChild(menu);

  const extras = home.rail?.extra_links || [];
  for (const link of extras) {
    const wrap = createElement('p', 'rail-label rail-label-link');
    const a = createElement('a', '', link.label);
    a.href = link.href;
    wrap.appendChild(a);
    railRoot.appendChild(wrap);
  }
}

function renderHome(home, updates) {
  const heading = document.getElementById('home-heading');
  const introLabel = document.getElementById('home-intro-label');
  const introPoints = document.getElementById('home-intro-points');
  const links = document.getElementById('home-links');
  const updatesLabel = document.getElementById('updates-label');
  const updatesList = document.getElementById('updates-list');
  const credits = document.getElementById('home-credits');

  if (!heading || !introLabel || !introPoints || !links || !updatesList || !credits) return;

  renderHomeRail(home);

  heading.textContent = home.heading || '';
  introLabel.textContent = home.intro_label || '';
  introPoints.innerHTML = '';
  for (const point of home.intro_points || []) {
    introPoints.appendChild(createElement('li', '', point));
  }

  const suffix = home.last_updated_suffix || (isEnglishLang() ? 'updated' : '更新');

  links.innerHTML = '';
  for (const item of home.sections || []) {
    const anchor = createElement('a', 'section-card');
    anchor.href = item.href;
    anchor.id = sectionAnchorId(item.title);
    anchor.appendChild(createElement('div', 'section-card-title', item.title));
    anchor.appendChild(createElement('p', 'section-card-desc', item.description));
    const footer = createElement('div', 'section-card-footer');
    if (item.last_updated) {
      footer.appendChild(createElement('span', 'section-card-latest', `${item.last_updated} ${suffix}`));
    }
    footer.appendChild(createElement('span', 'section-card-arrow', '↗'));
    anchor.appendChild(footer);
    links.appendChild(anchor);
  }

  if (updatesLabel) updatesLabel.textContent = home.updates_label || (isEnglishLang() ? 'Updates' : '更新');
  updatesList.innerHTML = '';
  for (const item of updates.items || []) {
    const li = createElement('div', 'timeline-item');

    const dot = createElement('span', 'timeline-dot');
    dot.setAttribute('aria-hidden', 'true');
    li.appendChild(dot);

    const time = createElement('time', 'timeline-date', item.date || '');
    if (item.datetime) time.dateTime = item.datetime;
    li.appendChild(time);

    const lines = Array.isArray(item.lines) && item.lines.length
      ? item.lines
      : Array.isArray(item.points) && item.points.length
        ? item.points
        : [item.title, item.summary].filter(Boolean);
    const linesDiv = createElement('div', 'timeline-lines');
    for (const line of lines) {
      linesDiv.appendChild(createElement('p', '', line));
    }
    li.appendChild(linesDiv);

    updatesList.appendChild(li);
  }

  const updatesMoreEl = document.getElementById('updates-more');
  if (updatesMoreEl) {
    updatesMoreEl.innerHTML = '';
    const href = updates.more_href;
    if (href && href !== '#') {
      const label = updates.more_label || (isEnglishLang() ? 'View all' : '查看更多');
      const a = createElement('a', 'updates-more-link', label);
      a.href = href;
      updatesMoreEl.appendChild(a);
      updatesMoreEl.style.display = '';
    } else {
      updatesMoreEl.style.display = 'none';
    }
  }

  renderHomeInbox(home);

  credits.innerHTML = '';
  for (const line of home.credits || []) {
    credits.appendChild(createElement('p', '', line));
  }
}

function renderHomeInbox(home) {
  const titleEl = document.getElementById('inbox-title');
  const introEl = document.getElementById('inbox-intro');
  const draftEl = document.getElementById('inbox-draft');
  const buttonEl = document.getElementById('inbox-button');
  const archiveEl = document.getElementById('inbox-archive-link');
  const visibilityLabel = document.getElementById('inbox-visibility-label');
  const visibilityPublic = document.getElementById('inbox-visibility-public');
  const visibilityPrivate = document.getElementById('inbox-visibility-private');
  const contactRow = document.getElementById('inbox-contact-row');
  const contactLabel = document.getElementById('inbox-contact-label');
  const contactInput = document.getElementById('inbox-contact');
  const statusEl = document.getElementById('inbox-status');

  if (titleEl) titleEl.textContent = home.inbox_title || (isEnglishLang() ? 'Anonymous inbox' : '匿名提问箱');
  if (introEl) introEl.textContent = home.inbox_intro || '';
  if (draftEl) draftEl.placeholder = home.inbox_placeholder || '';
  if (buttonEl) buttonEl.textContent = home.inbox_button || (isEnglishLang() ? 'Send' : '投递');
  if (archiveEl) {
    archiveEl.textContent = home.inbox_archive_label || '↗';
    if (home.inbox_archive_href) archiveEl.href = home.inbox_archive_href;
  }
  if (visibilityLabel) visibilityLabel.textContent = home.inbox_visibility_label || (isEnglishLang() ? 'Visibility' : '可见性');
  if (visibilityPublic) {
    const lbl = visibilityPublic.querySelector('span');
    if (lbl) lbl.textContent = home.inbox_visibility_public || (isEnglishLang() ? 'Public' : '公开');
  }
  if (visibilityPrivate) {
    const lbl = visibilityPrivate.querySelector('span');
    if (lbl) lbl.textContent = home.inbox_visibility_private || (isEnglishLang() ? 'Private' : '不公开');
  }
  if (contactLabel) contactLabel.textContent = home.inbox_contact_label || (isEnglishLang() ? 'Reply channel (required if private)' : '回信渠道（不公开时必填）');
  if (contactInput) contactInput.placeholder = home.inbox_contact_placeholder || '';

  if (!buttonEl || !draftEl) return;

  const radios = document.querySelectorAll('input[name="inbox-visibility"]');
  function syncContactVisibility() {
    const checked = document.querySelector('input[name="inbox-visibility"]:checked');
    const isPrivate = checked && checked.value === 'private';
    if (contactRow) contactRow.style.display = isPrivate ? '' : 'none';
  }
  radios.forEach((r) => r.addEventListener('change', syncContactVisibility));
  syncContactVisibility();

  buttonEl.disabled = false;
  buttonEl.addEventListener('click', async () => {
    const text = draftEl.value.trim();
    if (!text) {
      if (statusEl) statusEl.textContent = isEnglishLang() ? 'Please write something first.' : '先写点什么再投递。';
      return;
    }
    const visibility = (document.querySelector('input[name="inbox-visibility"]:checked')?.value) || 'public';
    const contact = contactInput?.value.trim() || '';
    if (visibility === 'private' && !contact) {
      if (statusEl) statusEl.textContent = isEnglishLang() ? 'Private replies need a contact channel.' : '不公开时需要留个回信渠道。';
      return;
    }
    const endpoint = home.inbox_endpoint || '';
    const submittedAt = new Date().toISOString();
    const payload = {
      question: text,
      visibility,
      contact,
      submittedAt,
      sourceUrl: window.location.href,
    };
    if (statusEl) statusEl.textContent = isEnglishLang() ? 'Sending…' : '正在投递……';
    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const subject = encodeURIComponent(visibility === 'public' ? '[公开] 匿名留言' : '[不公开] 匿名留言');
        const lines = [
          `可见性：${visibility === 'public' ? '公开' : '不公开'}`,
          contact ? `回信渠道：${contact}` : '',
          '',
          text,
        ].filter(Boolean);
        window.location.href = `mailto:wuruohan0522@gmail.com?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`;
      }
      // Local echo on the submitter's device until ReBone curates it into inbox.json.
      if (visibility === 'public') {
        try {
          const key = 'rebone-inbox-pending';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift({ submittedAt, question: text });
          localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        } catch (e) { /* localStorage may be blocked; ignore */ }
      }
      draftEl.value = '';
      if (contactInput) contactInput.value = '';
      if (statusEl) statusEl.textContent = home.inbox_sent_message || (isEnglishLang() ? 'Sent, thank you.' : '已记下，谢谢你写给我。');
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = isEnglishLang() ? 'Sending failed. Try again later.' : '投递失败了，稍后再试。';
    }
  });
}

async function initUpdatesArchive() {
  const root = document.getElementById('updates-page-root');
  if (!root) return;
  try {
    const data = await loadLocalizedJson('updates.json');
    const listEl = document.getElementById('updates-archive-list');
    const emptyEl = document.getElementById('updates-archive-empty');
    if (!listEl) return;
    listEl.innerHTML = '';
    const items = data.items || [];
    if (!items.length) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    for (const item of items) {
      const li = createElement('div', 'timeline-item');
      const dot = createElement('span', 'timeline-dot');
      dot.setAttribute('aria-hidden', 'true');
      li.appendChild(dot);
      const time = createElement('time', 'timeline-date', item.date || '');
      if (item.datetime) time.dateTime = item.datetime;
      li.appendChild(time);
      const lines = Array.isArray(item.lines) && item.lines.length
        ? item.lines
        : Array.isArray(item.points) && item.points.length
          ? item.points
          : [item.title, item.summary].filter(Boolean);
      const linesDiv = createElement('div', 'timeline-lines');
      for (const line of lines) {
        linesDiv.appendChild(createElement('p', '', line));
      }
      li.appendChild(linesDiv);
      listEl.appendChild(li);
    }
  } catch (error) {
    console.error(error);
  }
}

async function initInboxArchive() {
  const root = document.getElementById('inbox-page-root');
  if (!root) return;
  try {
    const data = await loadLocalizedJson('inbox.json');
    const titleEl = document.getElementById('inbox-title');
    const introEl = document.getElementById('inbox-intro');
    const listEl = document.getElementById('inbox-archive-list');
    const emptyEl = document.getElementById('inbox-archive-empty');
    if (titleEl) titleEl.textContent = data.title || (isEnglishLang() ? 'Public inbox' : '公开留言箱');
    if (introEl) introEl.textContent = data.intro || '';
    if (!listEl) return;
    listEl.innerHTML = '';

    let pending = [];
    try {
      pending = JSON.parse(localStorage.getItem('rebone-inbox-pending') || '[]');
    } catch (e) { /* ignore */ }

    const curated = data.items || [];
    if (!curated.length && !pending.length) {
      if (emptyEl) {
        emptyEl.textContent = data.empty_label || (isEnglishLang() ? 'No public messages yet.' : '暂时还没有公开的留言。');
        emptyEl.style.display = '';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    for (const item of pending) {
      const card = createElement('article', 'inbox-entry inbox-entry-pending');
      const dateText = item.submittedAt
        ? new Date(item.submittedAt).toLocaleDateString('zh-CN').replaceAll('/', '-')
        : '';
      if (dateText) card.appendChild(createElement('p', 'inbox-entry-date', `${dateText} · 你刚刚留下的（仅你这台设备可见，等待 ReBone 公开 + 回应）`));
      card.appendChild(createElement('p', 'inbox-entry-question', item.question || ''));
      listEl.appendChild(card);
    }

    for (const item of curated) {
      const card = createElement('article', 'inbox-entry');
      if (item.date) card.appendChild(createElement('p', 'inbox-entry-date', item.date));
      card.appendChild(createElement('p', 'inbox-entry-question', item.question || ''));
      if (item.answer) {
        card.appendChild(createElement('p', 'inbox-entry-answer-label', 'ReBone:'));
        card.appendChild(createElement('p', 'inbox-entry-answer', item.answer));
      }
      listEl.appendChild(card);
    }
  } catch (error) {
    console.error(error);
  }
}

function renderSolutions(data) {
  const title = document.getElementById('solutions-title');
  const intro = document.getElementById('solutions-intro');
  const filters = document.getElementById('solutions-filters');
  const cards = document.getElementById('solutions-cards');
  if (!title || !intro || !cards) return;

  title.textContent = data.title || 'Solutions';
  intro.textContent = data.intro || '';

  const allLabel = (data.filters && data.filters[0]) || (isEnglishLang() ? 'All' : '全部');
  let activeFilter = allLabel;

  function buildCardEl(card) {
    const anchor = createElement('a', 'frame-card');
    anchor.href = card.href;

    if (card.image) {
      const imageWrap = createElement('div', 'frame-card-image');
      const img = document.createElement('img');
      img.src = card.image;
      img.alt = card.image_alt || card.title || '';
      img.loading = 'lazy';
      imageWrap.appendChild(img);
      anchor.appendChild(imageWrap);
    }

    const head = createElement('div', 'frame-card-head');
    if (card.tags && card.tags.length) {
      const tagStrip = createElement('span', 'frame-card-tags');
      for (const t of card.tags) tagStrip.appendChild(createElement('span', 'frame-card-tag', t));
      head.appendChild(tagStrip);
    }
    head.appendChild(createElement('span', 'frame-card-arrow', '→'));
    anchor.appendChild(head);

    anchor.appendChild(createElement('h3', 'frame-card-title', card.title || ''));
    if (card.subtitle) anchor.appendChild(createElement('p', 'frame-card-subtitle', card.subtitle));
    if (card.summary) anchor.appendChild(createElement('p', 'frame-card-summary', card.summary));
    if (card.date) anchor.appendChild(createElement('p', 'frame-card-date', card.date));

    return anchor;
  }

  function endDateKey(dateStr) {
    // Pulls the rightmost YYYY[.MM] in the date string for sorting.
    // "2023.10 — 进行中" → treat 进行中 as today (priority newest)
    // "2025.09" → 2025.09
    const s = String(dateStr || '');
    if (/进行中|ongoing/i.test(s)) return '9999.12';
    const matches = s.match(/(\d{4})[.\-/](\d{1,2})/g) || [];
    if (matches.length) {
      const last = matches[matches.length - 1].replace(/[\-/]/, '.');
      const [y, m] = last.split('.');
      return `${y.padStart(4, '0')}.${(m || '01').padStart(2, '0')}`;
    }
    const yearOnly = s.match(/\d{4}/);
    return yearOnly ? `${yearOnly[0]}.01` : '0000.00';
  }

  function applyFilter() {
    cards.innerHTML = '';
    const list = (data.cards || [])
      .filter((c) => activeFilter === allLabel || (c.tags || []).includes(activeFilter))
      .slice()
      .sort((a, b) => endDateKey(b.date).localeCompare(endDateKey(a.date)));
    if (!list.length) {
      cards.appendChild(createElement('p', 'frame-empty', isEnglishLang() ? 'No items match this filter.' : '这个分类下还没有内容。'));
      return;
    }
    for (const card of list) cards.appendChild(buildCardEl(card));
  }

  if (filters) {
    filters.innerHTML = '';
    (data.filters || []).forEach((label, index) => {
      const btn = createElement('button', `filter-button${index === 0 ? ' active' : ''}`, label);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        activeFilter = label;
        filters.querySelectorAll('.filter-button').forEach((b) => b.classList.toggle('active', b === btn));
        applyFilter();
      });
      filters.appendChild(btn);
    });
  }

  applyFilter();
}

function renderProjectBlock(parent, block) {
  if (!block || typeof block !== 'object') return;
  const type = block.type;

  if (type === 'paragraph') {
    parent.appendChild(createElement('p', '', block.text || ''));
    return;
  }
  if (type === 'paragraphs') {
    for (const text of block.items || []) parent.appendChild(createElement('p', '', text));
    return;
  }
  if (type === 'quote') {
    const bq = createElement('blockquote', '', block.text || '');
    if (block.cite) {
      const cite = createElement('footer', 'block-cite', `— ${block.cite}`);
      bq.appendChild(cite);
    }
    parent.appendChild(bq);
    return;
  }
  if (type === 'subheading') {
    parent.appendChild(createElement('h3', '', block.text || ''));
    return;
  }
  if (type === 'list') {
    const list = createElement(block.ordered ? 'ol' : 'ul', 'block-list');
    for (const item of block.items || []) {
      if (typeof item === 'string') {
        list.appendChild(createElement('li', '', item));
      } else if (item && typeof item === 'object') {
        const li = document.createElement('li');
        if (item.label) {
          const strong = createElement('strong', '', item.label);
          li.appendChild(strong);
          if (item.text) li.appendChild(document.createTextNode(`：${item.text}`));
        } else if (item.text) {
          li.textContent = item.text;
        }
        list.appendChild(li);
      }
    }
    parent.appendChild(list);
    return;
  }
  if (type === 'meta') {
    const dl = createElement('dl', 'meta-list');
    for (const item of block.items || []) {
      const row = createElement('div', 'meta-row');
      row.appendChild(createElement('dt', '', item.label || ''));
      row.appendChild(createElement('dd', '', item.value || ''));
      dl.appendChild(row);
    }
    parent.appendChild(dl);
    return;
  }
  if (type === 'image') {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = block.src;
    img.alt = block.alt || '';
    img.loading = 'lazy';
    figure.appendChild(img);
    if (block.caption) figure.appendChild(createElement('figcaption', '', block.caption));
    parent.appendChild(figure);
    return;
  }
  if (type === 'image-placeholder') {
    const figure = createElement('figure', 'image-placeholder');
    figure.appendChild(createElement('span', 'image-placeholder-label', block.label || '【图】'));
    if (block.caption) figure.appendChild(createElement('figcaption', '', block.caption));
    parent.appendChild(figure);
    return;
  }
  if (type === 'two-col') {
    const grid = createElement('div', 'block-two-col');
    for (const col of block.columns || []) {
      const colEl = createElement('div', 'block-two-col-cell');
      if (col.title) colEl.appendChild(createElement('h4', '', col.title));
      if (col.text) colEl.appendChild(createElement('p', '', col.text));
      if (Array.isArray(col.items)) {
        const ul = createElement('ul', 'block-list');
        for (const item of col.items) ul.appendChild(createElement('li', '', item));
        colEl.appendChild(ul);
      }
      grid.appendChild(colEl);
    }
    parent.appendChild(grid);
    return;
  }
  if (type === 'callout') {
    const box = createElement('aside', 'block-callout');
    if (block.title) box.appendChild(createElement('h4', '', block.title));
    if (block.text) box.appendChild(createElement('p', '', block.text));
    if (Array.isArray(block.items)) {
      const ul = createElement('ul', 'block-list');
      for (const item of block.items) ul.appendChild(createElement('li', '', item));
      box.appendChild(ul);
    }
    if (block.link) {
      const a = createElement('a', 'block-callout-link', block.link.label || block.link.href);
      a.href = block.link.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      box.appendChild(a);
    }
    parent.appendChild(box);
    return;
  }
  if (type === 'details') {
    const det = document.createElement('details');
    if (block.open) det.open = true;
    const sum = createElement('summary', '', block.summary || '');
    det.appendChild(sum);
    const body = createElement('div', 'details-body');
    for (const child of block.blocks || []) renderProjectBlock(body, child);
    det.appendChild(body);
    parent.appendChild(det);
    return;
  }
  if (type === 'link-list') {
    const ul = createElement('ul', 'block-list block-links');
    for (const item of block.items || []) {
      const li = document.createElement('li');
      const a = createElement('a', '', item.label || item.href);
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      if (item.note) li.appendChild(document.createTextNode(`　${item.note}`));
      ul.appendChild(li);
    }
    parent.appendChild(ul);
    return;
  }
}

function renderProjectBlocks(sectionEl, section) {
  if (section.eyebrow) sectionEl.appendChild(createElement('p', 'section-eyebrow', section.eyebrow));
  if (section.title) sectionEl.appendChild(createElement('h2', '', section.title));
  if (section.lede) sectionEl.appendChild(createElement('p', 'section-lede', section.lede));
  for (const block of section.blocks || []) {
    renderProjectBlock(sectionEl, block);
  }
}

function renderRestraint(data) {
  const titleEls = document.querySelectorAll('[data-restraint-title]');
  const eyebrow = document.getElementById('restraint-eyebrow');
  const date = document.getElementById('restraint-date');
  const summary = document.getElementById('restraint-summary');
  const breadcrumb = document.getElementById('restraint-breadcrumb');
  const nav = document.getElementById('restraint-side-nav');
  const content = document.getElementById('restraint-content');
  if (!eyebrow || !date || !summary || !breadcrumb || !nav || !content) return;

  for (const el of titleEls) el.textContent = data.meta.title || '';
  eyebrow.textContent = data.meta.eyebrow || '';
  date.textContent = data.meta.date || '';
  summary.textContent = data.meta.summary || '';
  breadcrumb.textContent = data.meta.breadcrumb || '';

  nav.innerHTML = '';
  for (const item of data.nav || []) {
    const a = createElement('a', 'nav-item', item.label);
    a.href = `#${item.id}`;
    nav.appendChild(a);
  }

  content.innerHTML = '';
  for (const section of data.sections || []) {
    const sectionEl = createElement('section', 'content-section project-section');
    sectionEl.id = section.id;

    if (Array.isArray(section.blocks) && !section.layout) {
      renderProjectBlocks(sectionEl, section);
      content.appendChild(sectionEl);
      continue;
    }

    // Backward-compatible boxed layouts below.
    sectionEl.classList.add('mb-12', 'space-y-6');

    if (section.layout === 'overview') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      const grid = createElement('div', 'grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start');
      const left = document.createElement('div');
      left.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', section.eyebrow || ''));
      left.appendChild(createElement('h2', 'text-3xl font-semibold text-gray-900 mb-4', section.headline || section.title));
      appendParagraphs(left, section.paragraphs, 'text-gray-700 mb-4');
      if (section.quote) left.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', section.quote));
      grid.appendChild(left);
      if (section.image) {
        const img = document.createElement('img');
        img.src = section.image.src;
        img.alt = section.image.alt || '';
        img.className = 'w-full rounded-2xl border border-gray-200 object-cover';
        grid.appendChild(img);
      }
      card.appendChild(grid);
      sectionEl.appendChild(card);

      const statsGrid = createElement('div', 'grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6');
      for (const stat of section.stats || []) {
        const statCard = createElement('div', 'bg-white border border-gray-200 rounded-xl p-5');
        statCard.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', stat.title));
        if (stat.text) statCard.appendChild(createElement('p', 'text-sm text-gray-700', stat.text));
        if (stat.items) appendList(statCard, stat.items, { className: 'space-y-2 text-sm text-gray-700' });
        statsGrid.appendChild(statCard);
      }
      sectionEl.appendChild(statsGrid);
    }

    if (section.layout === 'two-column-note') {
      const grid = createElement('div', 'grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start');
      const left = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-4');
      left.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900', section.title));
      appendParagraphs(left, section.paragraphs, 'text-gray-700');
      grid.appendChild(left);
      const figure = createElement('figure', 'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm');
      const img = document.createElement('img');
      img.src = section.note_image.src;
      img.alt = section.note_image.alt || '';
      img.className = 'w-full rounded-xl border border-gray-200';
      figure.appendChild(img);
      figure.appendChild(createElement('figcaption', 'text-sm text-gray-500 mt-3', section.note_image.caption || ''));
      grid.appendChild(figure);
      sectionEl.appendChild(grid);
    }

    if (section.layout === 'research') {
      const primary = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      primary.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      primary.appendChild(createElement('p', 'text-gray-700 mb-4', section.intro || ''));
      const cols = createElement('div', 'grid gap-4 md:grid-cols-2');
      for (const col of section.risk_columns || []) {
        const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
        box.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', col.title));
        appendList(box, col.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
        cols.appendChild(box);
      }
      primary.appendChild(cols);
      const caseBox = createElement('div', 'mt-6 rounded-xl border border-gray-200 p-5');
      caseBox.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', section.case_box.title));
      caseBox.appendChild(createElement('p', 'text-gray-700 mb-3', section.case_box.text));
      const link = createElement('a', 'text-sm underline underline-offset-4 text-gray-700', section.case_box.link.label);
      link.href = section.case_box.link.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      caseBox.appendChild(link);
      primary.appendChild(caseBox);
      sectionEl.appendChild(primary);

      const sub = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      sub.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900 mb-4', section.subsection.title));
      appendParagraphs(sub, section.subsection.paragraphs, 'text-gray-700 mb-4');
      sectionEl.appendChild(sub);
    }

    if (section.layout === 'care-log') {
      const introCard = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      introCard.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      appendParagraphs(introCard, section.intro_paragraphs, 'text-gray-700 mb-4');
      sectionEl.appendChild(introCard);
      const grid = createElement('div', 'grid gap-6 lg:grid-cols-2');
      for (const card of section.cards || []) {
        const box = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-4');
        box.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900', card.title));
        appendParagraphs(box, card.paragraphs, 'text-gray-700');
        if (card.quote) box.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', card.quote));
        grid.appendChild(box);
      }
      sectionEl.appendChild(grid);
    }

    if (section.layout === 'product-study') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      card.appendChild(createElement('p', 'text-gray-700 mb-6', section.intro || ''));
      const grid = createElement('div', 'grid gap-4 md:grid-cols-3');
      for (const item of section.cards || []) {
        const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
        box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', item.title));
        box.appendChild(createElement('p', 'text-sm text-gray-700', item.text));
        grid.appendChild(box);
      }
      card.appendChild(grid);
      const closing = createElement('div', 'mt-6 rounded-xl border border-gray-200 p-5');
      closing.appendChild(createElement('p', 'text-gray-700', section.closing || ''));
      card.appendChild(closing);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'prototype') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-6', section.title));
      const wrap = createElement('div', 'space-y-8');
      (section.versions || []).forEach((version, index) => {
        const block = createElement('div', index ? 'border-t border-gray-200 pt-8' : '');
        const header = createElement('div', 'flex items-center justify-between gap-4 mb-3');
        header.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900', version.title));
        header.appendChild(createElement('span', 'text-sm text-gray-500', version.tag || ''));
        block.appendChild(header);
        block.appendChild(createElement('p', 'text-gray-700 mb-4', version.intro || ''));
        appendList(block, version.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
        wrap.appendChild(block);
      });
      card.appendChild(wrap);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'notes') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900', section.title));
      appendParagraphs(card, section.paragraphs, 'text-gray-700');
      card.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', section.quote || ''));
      sectionEl.appendChild(card);
    }

    if (section.layout === 'production') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-6', section.title));
      const stack = createElement('div', 'space-y-6');
      for (const block of section.blocks || []) {
        if (block.title && block.items) {
          const el = document.createElement('div');
          el.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          appendList(el, block.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
          stack.appendChild(el);
        }
        if (block.cards) {
          const grid = createElement('div', 'grid gap-4 md:grid-cols-2');
          for (const item of block.cards) {
            const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
            box.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', item.title));
            appendList(box, item.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
            grid.appendChild(box);
          }
          stack.appendChild(grid);
        }
        if (block.stages) {
          const wrapper = document.createElement('div');
          wrapper.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          const stageGrid = createElement('div', 'grid gap-4 md:grid-cols-2');
          for (const stage of block.stages) {
            const box = createElement('div', 'rounded-xl border border-gray-200 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', stage.title));
            box.appendChild(createElement('p', 'text-sm text-gray-700', stage.text));
            stageGrid.appendChild(box);
          }
          wrapper.appendChild(stageGrid);
          const compareGrid = createElement('div', 'grid gap-4 md:grid-cols-2 mt-4');
          for (const comp of block.compare || []) {
            const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', comp.title));
            appendList(box, comp.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
            compareGrid.appendChild(box);
          }
          wrapper.appendChild(compareGrid);
          stack.appendChild(wrapper);
        }
        if (block.title && block.support_cards) {
          const wrapper = document.createElement('div');
          wrapper.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          const grid = createElement('div', 'grid gap-4 md:grid-cols-2 xl:grid-cols-4');
          for (const item of block.support_cards) {
            const box = createElement('div', 'rounded-xl border border-gray-200 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', item.title));
            box.appendChild(createElement('p', 'text-sm text-gray-700', item.text));
            grid.appendChild(box);
          }
          wrapper.appendChild(grid);
          wrapper.appendChild(createElement('p', 'text-sm text-gray-700 mt-4', block.closing || ''));
          stack.appendChild(wrapper);
        }
      }
      card.appendChild(stack);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'thanks') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-5', section.title));
      const wrap = createElement('div', 'space-y-3 text-gray-700');
      for (const item of section.items || []) wrap.appendChild(createElement('p', '', item));
      card.appendChild(wrap);
      sectionEl.appendChild(card);
    }

    content.appendChild(sectionEl);
  }

  applyEnglishReadingMode(content);

  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.nav-item');
  function updateActiveNav() {
    let current = data.nav?.[0]?.id || '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140) current = section.id;
    });
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

function renderExpressions(data) {
  const title = document.getElementById('expressions-title');
  const intro = document.getElementById('expressions-intro');
  const categories = document.getElementById('expressions-categories');
  const railNav = document.getElementById('expressions-rail-nav');
  if (!title || !intro || !categories) return;

  title.textContent = data.title || 'Expressions';
  intro.innerHTML = '';
  for (const paragraph of data.intro || []) {
    intro.appendChild(createElement('p', '', paragraph));
  }

  // Rail nav: list of category anchors
  if (railNav) {
    railNav.innerHTML = '';
    for (const item of data.categories || []) {
      const a = createElement('a', '', `— ${item.title}`);
      a.href = `#cat-${item.id}`;
      railNav.appendChild(a);
    }
  }

  // Cards inline (no preview pane); each card shows full info
  categories.innerHTML = '';
  for (const item of data.categories || []) {
    const card = createElement('a', 'archive-card');
    card.href = item.href;
    card.id = `cat-${item.id}`;
    card.dataset.section = item.id;

    const body = createElement('div', 'archive-card-body');
    if (item.eyebrow) body.appendChild(createElement('p', 'archive-card-eyebrow', item.eyebrow));
    const head = createElement('div', 'archive-card-head');
    head.appendChild(createElement('h3', 'archive-card-title', item.title || ''));
    body.appendChild(head);
    if (item.card_description) body.appendChild(createElement('p', 'archive-card-summary', item.card_description));

    if (item.items && item.items.length) {
      const ul = createElement('ul', 'archive-card-items');
      for (const entry of item.items) {
        ul.appendChild(createElement('li', '', entry));
      }
      body.appendChild(ul);
    }

    if (item.tags && item.tags.length) {
      const tags = createElement('div', 'archive-card-tags');
      for (const tag of item.tags) {
        tags.appendChild(createElement('span', 'archive-card-tag', tag));
      }
      body.appendChild(tags);
    }

    body.appendChild(createElement('span', 'archive-card-cta', `${data.preview_link_label || '进入这个分类'} ↗`));

    card.appendChild(body);
    categories.appendChild(card);
  }
}

function dateKey(s) {
  if (!s) return '0000.00.00';
  const m = String(s).match(/(\d{4})(?:[.\-/](\d{1,2}))?(?:[.\-/](\d{1,2}))?/);
  if (!m) return '0000.00.00';
  const y = m[1];
  const mo = (m[2] || '00').padStart(2, '0');
  const d = (m[3] || '00').padStart(2, '0');
  return `${y}.${mo}.${d}`;
}

function renderReflections(data) {
  const title = document.getElementById('reflections-title');
  const subtitle = document.getElementById('reflections-subtitle');
  const intro = document.getElementById('reflections-intro');
  const footnote = document.getElementById('reflections-footnote');
  const statementsRoot = document.getElementById('reflections-statements');
  const panel = document.getElementById('reflections-panel');
  const panelTitle = document.getElementById('reflections-panel-title');
  const panelKeywords = document.getElementById('reflections-panel-keywords');
  const panelContent = document.getElementById('reflections-panel-content');
  const panelClose = document.getElementById('reflections-panel-close');
  const venn = document.getElementById('reflections-venn');
  if (!title || !panel || !panelContent || !venn) return;

  title.textContent = data.title || 'Reflections';
  if (subtitle) subtitle.textContent = data.subtitle || '';
  if (intro) {
    intro.innerHTML = '';
    (data.intro || []).forEach(text => intro.appendChild(createElement('p', '', text)));
  }
  if (footnote) footnote.textContent = data.footnote || '';

  if (statementsRoot) {
    statementsRoot.innerHTML = '';
    for (const st of data.statements || []) {
      const det = document.createElement('details');
      det.className = 'reflections-statement';
      const sum = createElement('summary', '', st.label || '');
      det.appendChild(sum);
      det.appendChild(createElement('p', '', st.text || ''));
      statementsRoot.appendChild(det);
    }
  }

  // Circle geometry in viewBox coords (must match SVG markup)
  const circles = {
    me:     { cx: 200, cy: 150, r: 95 },
    human:  { cx: 155, cy: 230, r: 95 },
    animal: { cx: 245, cy: 230, r: 95 },
  };

  function pointInCircle(x, y, c) {
    const dx = x - c.cx, dy = y - c.cy;
    return dx * dx + dy * dy <= c.r * c.r;
  }

  function regionAtPoint(x, y) {
    const inMe = pointInCircle(x, y, circles.me);
    const inHuman = pointInCircle(x, y, circles.human);
    const inAnimal = pointInCircle(x, y, circles.animal);
    if (inMe && inHuman && inAnimal) return 'life';
    if (inMe && inHuman) return 'social';
    if (inMe && inAnimal) return 'care';
    if (inHuman && inAnimal) return 'reciprocity';
    if (inMe) return 'me';
    if (inHuman) return 'human';
    if (inAnimal) return 'animal';
    return null;
  }

  function svgPointFromEvent(e) {
    const pt = venn.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = venn.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function showRegion(id) {
    const region = data.regions[id];
    if (!region) return;
    panelTitle.textContent = region.title || '';
    panelKeywords.textContent = (region.keywords || []).map((k) => `· ${k}`).join(' ');
    panelContent.innerHTML = '';

    const items = (region.items || []).slice().sort((a, b) => dateKey(b.date).localeCompare(dateKey(a.date)));
    if (!items.length) {
      panelContent.appendChild(createElement('p', 'reflections-row-empty', '这一块还在持续记录中。'));
    }
    for (const item of items) {
      const row = createElement('article', 'reflections-row');
      row.appendChild(createElement('span', 'reflections-row-date', item.date || '—'));
      const body = createElement('div', 'reflections-row-body');
      if (item.subtitle) body.appendChild(createElement('h3', 'reflections-row-subtitle', item.subtitle));
      body.appendChild(createElement('p', 'reflections-row-text', item.text || ''));
      row.appendChild(body);
      panelContent.appendChild(row);
    }

    panel.style.display = '';
    venn.dataset.active = id;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const pointer = document.getElementById('reflections-venn-pointer');
  function setHover(id) {
    venn.dataset.hover = id || '';
    if (pointer) {
      const region = id ? data.regions[id] : null;
      pointer.textContent = region ? `当前：${region.title}` : '当前：—';
    }
  }

  venn.style.cursor = 'crosshair';
  venn.addEventListener('click', (e) => {
    const pt = svgPointFromEvent(e);
    if (!pt) return;
    const id = regionAtPoint(pt.x, pt.y);
    if (id) showRegion(id);
  });
  venn.addEventListener('mousemove', (e) => {
    const pt = svgPointFromEvent(e);
    if (!pt) return;
    const id = regionAtPoint(pt.x, pt.y);
    setHover(id);
  });
  venn.addEventListener('mouseleave', () => setHover(''));

  if (panelClose) {
    panelClose.addEventListener('click', () => {
      panel.style.display = 'none';
      venn.dataset.active = '';
    });
  }

  // Open 我 by default — it's the user's own anchor.
  if (data.regions.me) showRegion('me');

  applyEnglishReadingMode(panelContent);
}

function renderVisualArchive(data) {
  const parent = document.getElementById('visual-breadcrumb-parent');
  const current = document.getElementById('visual-breadcrumb-current');
  const eyebrow = document.getElementById('visual-eyebrow');
  const title = document.getElementById('visual-title');
  const intro = document.getElementById('visual-intro');
  const works = document.getElementById('visual-works');
  if (!parent || !current || !eyebrow || !title || !intro || !works) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  works.innerHTML = '';
  for (const item of data.works || []) {
    const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 overflow-hidden');
    if (item.image?.src) {
      const img = document.createElement('img');
      img.src = item.image.src;
      img.alt = item.image.alt || item.title || '';
      img.className = 'h-72 w-full object-cover';
      article.appendChild(img);
    } else {
      const dark = item.image?.theme === 'dark';
      article.appendChild(createElement(
        'div',
        `h-72 flex items-center justify-center text-sm tracking-[0.2em] ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`,
        item.image?.label || 'IMAGE PLACEHOLDER'
      ));
    }

    const body = createElement('div', 'p-6');
    const header = createElement('div', 'flex items-center justify-between gap-4 mb-3');
    header.appendChild(createElement('h3', 'text-xl font-semibold', item.title || ''));
    header.appendChild(createElement('span', 'text-xs text-gray-500', item.date || ''));
    body.appendChild(header);
    body.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', item.summary || ''));
    if (item.quote) body.appendChild(createElement('blockquote', 'border-l-4 border-gray-300 pl-4 text-sm text-gray-600 italic', item.quote));
    article.appendChild(body);
    works.appendChild(article);
  }

  if (data.reserved) {
    const reserved = createElement('article', 'bg-white rounded-2xl border border-dashed border-gray-300 p-6 lg:col-span-2');
    const row = createElement('div', 'flex flex-col md:flex-row md:items-center md:justify-between gap-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', data.reserved.eyebrow || 'Reserved'));
    left.appendChild(createElement('h3', 'text-xl font-semibold mb-2', data.reserved.title || ''));
    left.appendChild(createElement('p', 'text-sm text-gray-600', data.reserved.text || ''));
    row.appendChild(left);
    row.appendChild(createElement('span', 'text-sm text-gray-400', data.reserved.tag || ''));
    reserved.appendChild(row);
    works.appendChild(reserved);
  }
}

function renderSoundArchive(data) {
  const parent = document.getElementById('sound-breadcrumb-parent');
  const current = document.getElementById('sound-breadcrumb-current');
  const eyebrow = document.getElementById('sound-eyebrow');
  const title = document.getElementById('sound-title');
  const intro = document.getElementById('sound-intro');
  const noticeTitle = document.getElementById('sound-notice-title');
  const noticeBody = document.getElementById('sound-notice-body');
  const noticeFootnote = document.getElementById('sound-notice-footnote');
  const sideNav = document.getElementById('sound-side-nav');
  const sectionsRoot = document.getElementById('sound-sections');
  if (!parent || !current || !eyebrow || !title || !intro || !noticeTitle || !noticeBody || !noticeFootnote || !sideNav || !sectionsRoot) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  noticeTitle.textContent = data.notice?.title || '';
  noticeBody.innerHTML = '';
  (data.notice?.paragraphs || []).forEach((paragraph, index) => {
    const p = createElement('p', '', paragraph);
    if (index === (data.notice?.paragraphs || []).length - 1 && data.notice?.contact) {
      const link = createElement('a', 'underline underline-offset-4', data.notice.contact.label || '');
      link.href = data.notice.contact.href;
      p.appendChild(link);
    }
    noticeBody.appendChild(p);
  });
  noticeFootnote.textContent = data.notice?.footnote || '';

  sideNav.innerHTML = '';
  sectionsRoot.innerHTML = '';

  const createAudioCard = (item) => {
    const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 p-5');
    const row = createElement('div', 'flex gap-4 items-start');
    row.appendChild(createElement('div', 'w-20 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0', item.cover_label || '封面位'));
    const content = createElement('div', 'min-w-0 w-full');
    content.appendChild(createElement('h4', 'text-lg font-semibold mb-1', item.title || ''));
    if (item.quote) content.appendChild(createElement('p', 'text-sm text-gray-600 mb-1', item.quote));
    if (item.origin) content.appendChild(createElement('p', 'text-xs text-gray-500 mb-1', item.origin));
    if (item.credit) content.appendChild(createElement('p', 'text-xs text-gray-500 mb-2', item.credit));
    if (item.date) content.appendChild(createElement('p', 'text-xs text-gray-400 mb-2', item.date));
    row.appendChild(content);
    article.appendChild(row);
    if (item.audio?.src) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'metadata';
      audio.className = 'w-full mt-3';
      const source = document.createElement('source');
      source.src = item.audio.src;
      if (item.audio.type) source.type = item.audio.type;
      audio.appendChild(source);
      article.appendChild(audio);
    }
    return article;
  };

  for (const section of data.sections || []) {
    const navLink = createElement('a', 'nav-item side-link', section.side_label || section.title || '');
    navLink.href = `#${section.id}`;
    navLink.dataset.sideLink = section.id;
    sideNav.appendChild(navLink);

    const sectionEl = createElement('section', 'scroll-mt-24');
    sectionEl.id = section.id;
    const header = createElement('div', 'flex items-end justify-between gap-4 mb-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', section.section_label || ''));
    left.appendChild(createElement('h3', 'text-2xl font-semibold', section.title || ''));
    header.appendChild(left);
    if (section.tag) header.appendChild(createElement('span', 'text-sm text-gray-400', section.tag));
    sectionEl.appendChild(header);

    if (section.note) sectionEl.appendChild(createElement('p', 'text-sm text-gray-600 mb-5', section.note));

    if (section.items?.length) {
      const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');
      section.items.forEach(item => grid.appendChild(createAudioCard(item)));
      sectionEl.appendChild(grid);
    }

    if (section.footnote) sectionEl.appendChild(createElement('p', 'text-xs text-gray-500 mt-5', section.footnote));

    if (section.wish || section.pricing) {
      const wrapper = createElement('div', 'bg-white rounded-2xl border border-gray-200 p-6 space-y-6 text-sm text-gray-700');
      if (section.wish) {
        const wish = createElement('div');
        wish.appendChild(createElement('p', 'font-semibold mb-3', section.wish.title || ''));
        wish.appendChild(createElement('p', 'text-gray-600 mb-3', section.wish.description || ''));
        const inputGrid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-3');
        const track = document.createElement('input');
        track.id = 'wishTrack';
        track.type = 'text';
        track.placeholder = section.wish.track_placeholder || '';
        track.className = 'rounded-lg border border-gray-300 px-3 py-2';
        inputGrid.appendChild(track);
        const artist = document.createElement('input');
        artist.id = 'wishArtist';
        artist.type = 'text';
        artist.placeholder = section.wish.artist_placeholder || '';
        artist.className = 'rounded-lg border border-gray-300 px-3 py-2';
        inputGrid.appendChild(artist);
        wish.appendChild(inputGrid);
        const note = document.createElement('textarea');
        note.id = 'wishNote';
        note.placeholder = section.wish.note_placeholder || '';
        note.className = 'mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 min-h-24';
        wish.appendChild(note);
        const actions = createElement('div', 'mt-3 flex flex-wrap gap-3');
        const button = createElement('button', 'rounded-lg bg-black text-white px-4 py-2 hover:bg-gray-800', section.wish.button_label || '提交许愿（邮件）');
        button.id = 'sendWish';
        button.type = 'button';
        actions.appendChild(button);
        actions.appendChild(createElement('span', 'text-xs text-gray-500 self-center', section.wish.hint || ''));
        wish.appendChild(actions);
        wrapper.appendChild(wish);
      }

      if (section.pricing) {
        const pricing = createElement('div');
        pricing.appendChild(createElement('p', 'font-semibold mb-3', section.pricing.title || ''));
        const overflow = createElement('div', 'overflow-x-auto');
        const table = createElement('table', 'min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden');
        const thead = createElement('thead', 'bg-gray-50 text-gray-700');
        const headRow = document.createElement('tr');
        (section.pricing.columns || []).forEach(label => {
          headRow.appendChild(createElement('th', 'text-left px-4 py-3 border-b border-gray-200', label));
        });
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        (section.pricing.rows || []).forEach((row, rowIndex, rows) => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            tr.appendChild(createElement('td', `px-4 py-3${rowIndex < rows.length - 1 ? ' border-b border-gray-100' : ''}`, cell));
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        overflow.appendChild(table);
        pricing.appendChild(overflow);
        if (section.pricing.timeline) {
          pricing.appendChild(createElement('div', 'rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600 mt-4', section.pricing.timeline));
        }
        if (section.pricing.contact) {
          const contact = createElement('div', 'rounded-xl bg-black text-white px-4 py-3 text-sm inline-block mt-4');
          const prefix = document.createTextNode(section.pricing.contact_label || '联系方式：');
          contact.appendChild(prefix);
          const link = createElement('a', 'underline underline-offset-4', section.pricing.contact.label || '');
          link.href = section.pricing.contact.href;
          contact.appendChild(link);
          pricing.appendChild(contact);
        }
        wrapper.appendChild(pricing);
      }
      sectionEl.appendChild(wrapper);
    }

    sectionsRoot.appendChild(sectionEl);
  }

  const allAudios = Array.from(document.querySelectorAll('#sound-sections audio'));
  allAudios.forEach(currentAudio => {
    currentAudio.addEventListener('play', () => {
      allAudios.forEach(other => {
        if (other !== currentAudio && !other.paused) other.pause();
      });
    });
  });

  const sideLinks = Array.from(document.querySelectorAll('#sound-side-nav [data-side-link]'));
  const sectionEls = (data.sections || []).map(section => document.getElementById(section.id)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      sideLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.sideLink === id);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
  sectionEls.forEach(sec => observer.observe(sec));
  if (!sideLinks.some(link => link.classList.contains('active')) && sideLinks[0]) {
    sideLinks[0].classList.add('active');
  }

  const sendWish = document.getElementById('sendWish');
  if (sendWish) {
    sendWish.addEventListener('click', () => {
      const track = (document.getElementById('wishTrack')?.value || '').trim();
      const artist = (document.getElementById('wishArtist')?.value || '').trim();
      const note = (document.getElementById('wishNote')?.value || '').trim();
      const subject = encodeURIComponent(data.sections?.find(section => section.id === 'wish-order')?.wish?.mail_subject || '曲目许愿');
      const mailTo = data.sections?.find(section => section.id === 'wish-order')?.wish?.mail_to || 'wuruohan0522@gmail.com';
      const body = encodeURIComponent(`曲目名称：${track || '（未填）'}\n作者/作曲：${artist || '（未填）'}\n\n补充：${note || '（无）'}`);
      window.location.href = `mailto:${mailTo}?subject=${subject}&body=${body}`;
    });
  }
}

function renderFandomArchive(data) {
  const parent = document.getElementById('fandom-breadcrumb-parent');
  const current = document.getElementById('fandom-breadcrumb-current');
  const eyebrow = document.getElementById('fandom-eyebrow');
  const title = document.getElementById('fandom-title');
  const intro = document.getElementById('fandom-intro');
  const sectionsRoot = document.getElementById('fandom-sections');
  if (!parent || !current || !eyebrow || !title || !intro || !sectionsRoot) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  sectionsRoot.innerHTML = '';
  for (const section of data.sections || []) {
    const sectionEl = document.createElement('section');
    const header = createElement('div', 'flex items-end justify-between gap-4 mb-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', section.section_label || ''));
    left.appendChild(createElement('h3', 'text-2xl font-semibold', section.title || ''));
    header.appendChild(left);
    if (section.tag) header.appendChild(createElement('span', 'text-sm text-gray-400', section.tag));
    sectionEl.appendChild(header);

    if (section.featured && section.summary_card) {
      const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 overflow-hidden entry-hover');
      const grid = createElement('div', 'grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]');
      const featured = createElement('a', 'bg-gray-900 text-white p-6 flex flex-col justify-between min-h-64 hover:bg-gray-800 transition');
      featured.href = section.featured.href;
      featured.appendChild(createElement('p', 'text-xs tracking-[0.2em] text-gray-300 uppercase', section.featured.status || ''));
      const featuredBody = document.createElement('div');
      featuredBody.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', section.featured.title || ''));
      featuredBody.appendChild(createElement('p', 'text-sm text-gray-200', section.featured.description || ''));
      featured.appendChild(featuredBody);
      const cta = createElement('span', 'inline-flex items-center gap-2 text-sm underline underline-offset-4', section.featured.cta || '进入系列页');
      cta.appendChild(createElement('span', '', '↗'));
      featured.appendChild(cta);
      grid.appendChild(featured);

      const summary = createElement('div', 'p-6');
      const summaryHeader = createElement('div', 'flex items-center justify-between gap-4 mb-3');
      summaryHeader.appendChild(createElement('h4', 'text-xl font-semibold', section.summary_card.title || ''));
      summaryHeader.appendChild(createElement('span', 'text-xs text-gray-500', section.summary_card.tag || ''));
      summary.appendChild(summaryHeader);
      summary.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', section.summary_card.text || ''));
      const bullets = createElement('div', 'space-y-2 text-sm text-gray-600 mb-5');
      (section.summary_card.bullets || []).forEach(item => bullets.appendChild(createElement('p', '', `· ${item}`)));
      summary.appendChild(bullets);
      grid.appendChild(summary);
      article.appendChild(grid);
      sectionEl.appendChild(article);
    }

    if (section.cards?.length) {
      const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');
      for (const card of section.cards) {
        if (card.type === 'link') {
          const anchor = createElement('a', 'bg-white rounded-2xl border border-gray-200 p-6 entry-hover block');
          anchor.href = card.href;
          anchor.appendChild(createElement('p', 'text-xs uppercase tracking-[0.2em] text-gray-400 mb-2', card.eyebrow || ''));
          anchor.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', card.title || ''));
          anchor.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', card.description || ''));
          const tags = createElement('div', 'flex flex-wrap gap-2 text-xs text-gray-500 mb-4');
          (card.tags || []).forEach(tag => tags.appendChild(createElement('span', 'px-2 py-1 border border-gray-200 rounded-full', tag)));
          anchor.appendChild(tags);
          anchor.appendChild(createElement('span', 'text-sm underline underline-offset-4', `${card.cta || '进入作品详情'} ↗`));
          grid.appendChild(anchor);
        } else {
          const article = createElement('article', 'bg-white rounded-2xl border border-dashed border-gray-300 p-6');
          article.appendChild(createElement('p', 'text-xs uppercase tracking-[0.2em] text-gray-400 mb-2', card.eyebrow || ''));
          article.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', card.title || ''));
          article.appendChild(createElement('p', 'text-sm text-gray-600', card.description || ''));
          grid.appendChild(article);
        }
      }
      sectionEl.appendChild(grid);
    }

    sectionsRoot.appendChild(sectionEl);
  }
}

async function initHome() {
  if (!document.getElementById('home-content-root')) return;
  try {
    const [home, updates] = await Promise.all([
      loadLocalizedJson('home.json'),
      loadLocalizedJson('updates.json'),
    ]);
    renderHome(home, updates);
  } catch (error) {
    console.error(error);
  }
}

async function initReadme() {
  const article = document.getElementById('readme-article');
  if (!article) return;
  try {
    article.innerHTML = await loadLocalizedText('readme.article.html');
    applyEnglishReadingMode(article, { article: true });
  } catch (error) {
    console.error(error);
  }
}

async function initSolutions() {
  if (!document.getElementById('solutions-page-root')) return;
  try {
    const data = await loadLocalizedJson('solutions.json');
    renderSolutions(data);
  } catch (error) {
    console.error(error);
  }
}

async function initRestraint() {
  const root = document.getElementById('restraint-page-root');
  if (!root) return;
  try {
    const contentFile = root.dataset.contentFile || 'solutions_restraint.json';
    const data = await loadLocalizedJson(contentFile);
    renderRestraint(data);
  } catch (error) {
    console.error(error);
  }
}

async function initExpressions() {
  if (!document.getElementById('expressions-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions.json');
    renderExpressions(data);
  } catch (error) {
    console.error(error);
  }
}

async function initVisualArchive() {
  if (!document.getElementById('visual-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_visual.json');
    renderVisualArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initSoundArchive() {
  if (!document.getElementById('sound-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_sound.json');
    renderSoundArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initFandomArchive() {
  if (!document.getElementById('fandom-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_fandom.json');
    renderFandomArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initReflections() {
  if (!document.getElementById('reflections-page-root')) return;
  try {
    const data = await loadLocalizedJson('reflections.json');
    renderReflections(data);
  } catch (error) {
    console.error(error);
  }
}

function rescrollToHash() {
  if (!window.location.hash) return;
  const id = window.location.hash.slice(1);
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.ReBoneI18n?.initSiteChrome) {
    await window.ReBoneI18n.initSiteChrome();
  }

  await Promise.all([
    initHome(),
    initReadme(),
    initSolutions(),
    initRestraint(),
    initExpressions(),
    initVisualArchive(),
    initSoundArchive(),
    initFandomArchive(),
    initReflections(),
    initInboxArchive(),
    initUpdatesArchive(),
  ]);
  requestAnimationFrame(() => requestAnimationFrame(rescrollToHash));
});
