/* ============================================
   FOTOAMIGOS v2 — SPA Logic
   Vanilla JS · No frameworks · No build step
   ============================================ */

// ---- CONFIG & STATE ----
let CONFIG = null;

async function loadConfig() {
  try {
    const resp = await fetch('config.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    CONFIG = await resp.json();
    console.log('config.json loaded, heroes:', CONFIG.superheroes.length);
  } catch (e) {
    console.warn('fetch config.json failed:', e.message);
    if (window.__FOTOAMIGOS_CONFIG) {
      CONFIG = window.__FOTOAMIGOS_CONFIG;
    } else {
      console.error('Could not load config.json.');
    }
  }
}

const navStack = []; // navigation stack: [{screen, params}]
let currentOverlayHero = null;
let slideshowIndex = 0;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();

  // Wire up splash
  document.getElementById('btn-start').addEventListener('click', () => exitSplash());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('screen-splash').classList.contains('hidden')) {
      exitSplash();
    }
  });

  // Wire up header
  document.getElementById('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateToHome();
  });
  document.getElementById('btn-back').addEventListener('click', () => navigateBack());

  // Wire up overlay
  document.getElementById('overlay-backdrop').addEventListener('click', () => closeOverlay());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('overlay').classList.contains('hidden')) {
        closeOverlay();
      } else if (navStack.length > 1) {
        navigateBack();
      }
    }
    // Arrow keys for slideshow in P04
    if (e.key === 'ArrowLeft') slideshowPrev();
    if (e.key === 'ArrowRight') slideshowNext();
  });
});

// ============================================
// SPLASH
// ============================================

function exitSplash() {
  const splash = document.getElementById('screen-splash');
  splash.classList.add('exiting');
  setTimeout(() => {
    splash.classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    navigateToHome();
  }, 400);
}

// ============================================
// NAVIGATION
// ============================================

function navigateToHome() {
  navStack.length = 0;
  navStack.push({ screen: 'home', params: {} });
  renderScreen();
}

function navigateToAtributo(attrKey, attrValue) {
  navStack.push({ screen: 'atributo', params: { attrKey, attrValue } });
  renderScreen();
}

function navigateToSuperheroe(heroId) {
  navStack.push({ screen: 'superheroe', params: { heroId } });
  renderScreen();
}

function navigateBack() {
  if (navStack.length > 1) {
    navStack.pop();
    renderScreen();
  }
}

function getCurrentNav() {
  return navStack[navStack.length - 1];
}

// ============================================
// RENDER SCREEN
// ============================================

function renderScreen() {
  const nav = getCurrentNav();
  closeOverlay();

  // Toggle screens
  document.getElementById('screen-home').classList.toggle('hidden', nav.screen !== 'home');
  document.getElementById('screen-atributo').classList.toggle('hidden', nav.screen !== 'atributo');
  document.getElementById('screen-superheroe').classList.toggle('hidden', nav.screen !== 'superheroe');

  // Update header
  const backBtn = document.getElementById('btn-back');
  const headerCenter = document.getElementById('header-center');
  backBtn.classList.toggle('hidden', nav.screen === 'home');

  if (nav.screen === 'home') {
    headerCenter.innerHTML = '';
  } else if (nav.screen === 'atributo') {
    const attr = CONFIG.atributos.find(a => a.key === nav.params.attrKey);
    const extUrl = getAttrValueUrl(nav.params.attrKey, nav.params.attrValue);
    const valueHtml = extUrl
      ? `<a class="header-attr-value" href="${extUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">${nav.params.attrValue.toUpperCase()}<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-left:4px;opacity:0.6;">open_in_new</span></a>`
      : `<span class="header-attr-value">${nav.params.attrValue.toUpperCase()}</span>`;
    headerCenter.innerHTML = `
      <span class="header-attr-type" style="color:${attr.color}">${attr.label}</span>
      ${valueHtml}
    `;
  } else if (nav.screen === 'superheroe') {
    const hero = CONFIG.superheroes.find(h => h.id === nav.params.heroId);
    headerCenter.innerHTML = `<span class="header-hero-name">${hero.nombre}</span>`;
  }

  // Render screen content
  if (nav.screen === 'home') renderHome();
  else if (nav.screen === 'atributo') renderAtributo();
  else if (nav.screen === 'superheroe') renderSuperheroe();
}

// ============================================
// P02: HOME
// ============================================

function renderHome() {
  const grid = document.getElementById('home-grid');
  grid.innerHTML = '';

  CONFIG.superheroes.forEach((hero, idx) => {
    const container = document.createElement('div');
    container.className = 'card-container';
    container.dataset.heroId = hero.id;
    container.style.animationDelay = `${idx * 0.05 + 0.05}s`;

    const flipper = document.createElement('div');
    flipper.className = 'card-flipper';

    // Back
    flipper.appendChild(buildCardBack(idx));

    // Front (collapsed)
    flipper.appendChild(buildCollapsedFront(hero, null));

    container.appendChild(flipper);

    // Click to flip
    container.addEventListener('click', (e) => {
      // If already flipped, open overlay
      if (container.classList.contains('flipped')) {
        openOverlay(hero.id);
        return;
      }

      // Unflip any other flipped card
      document.querySelectorAll('.card-container.flipped').forEach(c => {
        if (c !== container) c.classList.remove('flipped');
      });

      container.classList.add('flipped');
    });

    grid.appendChild(container);
  });
}

function buildCardBack(idx) {
  const back = document.createElement('div');
  back.className = 'card-back';

  const halftone = document.createElement('div');
  halftone.className = 'card-back-halftone';
  back.appendChild(halftone);

  const innerBorder = document.createElement('div');
  innerBorder.className = 'card-back-inner-border';
  back.appendChild(innerBorder);

  const emblem = document.createElement('div');
  emblem.className = 'card-back-emblem';

  const circle = document.createElement('div');
  circle.className = 'card-back-circle';
  circle.innerHTML = '<span class="material-symbols-outlined filled">auto_awesome</span>';
  emblem.appendChild(circle);

  const label = document.createElement('div');
  label.className = 'card-back-label';
  // Slight random rotation
  const rotations = [-3, -2, -1, 1, 2, 3];
  label.style.transform = `rotate(${rotations[idx % rotations.length]}deg)`;
  label.innerHTML = '<span>FOTOAMIGOS</span>';
  emblem.appendChild(label);

  back.appendChild(emblem);
  return back;
}

function buildCollapsedFront(hero, contextAttr) {
  const front = document.createElement('div');
  front.className = 'card-front';

  // Header
  const header = document.createElement('div');
  header.className = 'collapsed-header';

  const name = document.createElement('span');
  name.className = 'collapsed-name';
  name.textContent = hero.nombre;
  name.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToSuperheroe(hero.id);
  });
  header.appendChild(name);

  const cameraBadge = document.createElement('span');
  cameraBadge.className = 'collapsed-camera-badge';
  cameraBadge.textContent = hero.camara.name.toUpperCase();
  cameraBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToAtributo('camara', hero.camara.name);
  });
  header.appendChild(cameraBadge);

  front.appendChild(header);

  // Photo
  const photo = document.createElement('div');
  photo.className = 'collapsed-photo';
  if (hero.avatar) {
    const img = document.createElement('img');
    img.src = hero.avatar;
    img.alt = hero.nombre;
    photo.appendChild(img);
    const ht = document.createElement('div');
    ht.className = 'halftone';
    photo.appendChild(ht);
  } else {
    photo.innerHTML = `
      <div class="collapsed-photo-placeholder">
        <span class="material-symbols-outlined">photo_camera</span>
      </div>
    `;
  }
  photo.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToSuperheroe(hero.id);
  });
  front.appendChild(photo);

  // Special / Contextual attribute
  const special = document.createElement('div');
  special.className = 'collapsed-special';

  const attr = contextAttr || CONFIG.atributos.find(a => a.key === 'poder_especial');
  const attrIcon = document.createElement('div');
  attrIcon.className = 'collapsed-special-icon';
  attrIcon.style.background = attr.color;
  attrIcon.innerHTML = `<span class="material-symbols-outlined filled">${attr.icon}</span>`;
  special.appendChild(attrIcon);

  const info = document.createElement('div');
  const label = document.createElement('div');
  label.className = 'collapsed-special-label';
  label.textContent = attr.label;
  info.appendChild(label);

  const value = document.createElement('div');
  value.className = 'collapsed-special-value';

  if (contextAttr) {
    // Show the contextual attribute value for this hero
    const heroVal = getHeroAttrValue(hero, contextAttr.key);
    value.textContent = heroVal.join(', ');
    // Make values clickable
    value.style.cursor = 'pointer';
    value.addEventListener('click', (e) => {
      e.stopPropagation();
      if (heroVal.length > 0) {
        navigateToAtributo(contextAttr.key, heroVal[0]);
      }
    });
  } else {
    value.textContent = hero.poder_especial.join(', ');
    value.style.cursor = 'pointer';
    value.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToAtributo('poder_especial', hero.poder_especial[0]);
    });
  }

  info.appendChild(value);
  special.appendChild(info);
  front.appendChild(special);

  return front;
}

function getHeroAttrValue(hero, attrKey) {
  if (attrKey === 'camara') return [hero.camara.name];
  const raw = hero[attrKey] || [];
  // Object attributes: extract .name from each item
  if (raw.length > 0 && typeof raw[0] === 'object') return raw.map(item => item.name);
  return raw;
}

// Find an external URL for a given attribute value (if any hero has one)
function getAttrValueUrl(attrKey, attrValueName) {
  const normalizedName = attrValueName.toLowerCase().trim();
  for (const hero of CONFIG.superheroes) {
    if (attrKey === 'camara') {
      if (hero.camara.name.toLowerCase().trim() === normalizedName && hero.camara.url) {
        return hero.camara.url;
      }
    } else {
      const items = hero[attrKey] || [];
      for (const item of items) {
        if (typeof item === 'object' && item.name.toLowerCase().trim() === normalizedName && item.url) {
          return item.url;
        }
      }
    }
  }
  return null;
}

// ============================================
// OVERLAY (Expanded Card)
// ============================================

function openOverlay(heroId) {
  const hero = CONFIG.superheroes.find(h => h.id === heroId);
  if (!hero) return;

  currentOverlayHero = heroId;
  const card = document.getElementById('overlay-card');
  card.innerHTML = '';
  card.appendChild(buildExpandedCard(hero));

  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden', 'exiting');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  const overlay = document.getElementById('overlay');
  if (overlay.classList.contains('hidden')) return;

  overlay.classList.add('exiting');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('exiting');
    document.body.style.overflow = '';
    currentOverlayHero = null;
  }, 200);
}

function buildExpandedCard(hero) {
  const card = document.createElement('div');

  // Header
  const header = document.createElement('div');
  header.className = 'expanded-header';

  const name = document.createElement('span');
  name.className = 'expanded-name';
  name.textContent = hero.nombre;
  name.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
    setTimeout(() => navigateToSuperheroe(hero.id), 250);
  });
  header.appendChild(name);

  const cameraBadge = document.createElement('span');
  cameraBadge.className = 'expanded-camera-badge';
  cameraBadge.textContent = hero.camara.name.toUpperCase();
  cameraBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
    setTimeout(() => navigateToAtributo('camara', hero.camara.name), 250);
  });
  header.appendChild(cameraBadge);

  card.appendChild(header);

  // Photo
  const photo = document.createElement('div');
  photo.className = 'expanded-photo';
  if (hero.avatar) {
    const img = document.createElement('img');
    img.src = hero.avatar;
    img.alt = hero.nombre;
    photo.appendChild(img);
    const ht = document.createElement('div');
    ht.className = 'halftone';
    photo.appendChild(ht);
  } else {
    photo.innerHTML = `
      <div class="expanded-photo-placeholder">
        <span class="material-symbols-outlined">photo_camera</span>
      </div>
    `;
  }
  photo.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
    setTimeout(() => navigateToSuperheroe(hero.id), 250);
  });
  card.appendChild(photo);

  // Poder Especial
  const special = document.createElement('div');
  special.className = 'expanded-special';

  const specHeader = document.createElement('div');
  specHeader.className = 'expanded-special-header';

  const specIcon = document.createElement('div');
  specIcon.className = 'expanded-special-icon';
  specIcon.innerHTML = '<span class="material-symbols-outlined filled">auto_fix_high</span>';
  specHeader.appendChild(specIcon);

  const specLabel = document.createElement('span');
  specLabel.className = 'expanded-special-label';
  specLabel.textContent = 'PODER ESPECIAL';
  specHeader.appendChild(specLabel);

  special.appendChild(specHeader);

  const specValueBox = document.createElement('div');
  specValueBox.className = 'expanded-special-value-box';
  hero.poder_especial.forEach(val => {
    const span = document.createElement('span');
    span.textContent = val.toUpperCase();
    span.style.cursor = 'pointer';
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      closeOverlay();
      setTimeout(() => navigateToAtributo('poder_especial', val), 250);
    });
    specValueBox.appendChild(span);
  });
  special.appendChild(specValueBox);
  card.appendChild(special);

  // Attributes
  const attrs = document.createElement('div');
  attrs.className = 'expanded-attrs';

  // Skip camara and poder_especial (already shown)
  const displayAttrs = CONFIG.atributos.filter(a => a.key !== 'camara' && a.key !== 'poder_especial');

  displayAttrs.forEach(attr => {
    const row = document.createElement('div');
    row.className = 'expanded-attr-row';

    const iconBox = document.createElement('div');
    iconBox.className = 'expanded-attr-icon-box';
    iconBox.style.background = attr.color;
    iconBox.innerHTML = `<span class="material-symbols-outlined filled">${attr.icon}</span>`;
    row.appendChild(iconBox);

    const content = document.createElement('div');
    content.className = 'expanded-attr-content';

    const label = document.createElement('div');
    label.className = 'expanded-attr-label';
    label.textContent = attr.label;
    content.appendChild(label);

    const tags = document.createElement('div');
    tags.className = 'expanded-attr-tags';

    const values = getHeroAttrValue(hero, attr.key);
    values.forEach(val => {
      const tag = document.createElement('span');
      tag.className = 'attr-tag';
      tag.textContent = val;
      tag.style.background = attr.containerColor;
      tag.style.color = attr.onContainerColor;
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        closeOverlay();
        setTimeout(() => navigateToAtributo(attr.key, val), 250);
      });
      tags.appendChild(tag);
    });

    content.appendChild(tags);
    row.appendChild(content);
    attrs.appendChild(row);
  });

  card.appendChild(attrs);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'expanded-footer';
  card.appendChild(footer);

  return card;
}

// ============================================
// P03: ATRIBUTO
// ============================================

function renderAtributo() {
  const nav = getCurrentNav();
  const { attrKey, attrValue } = nav.params;
  const attr = CONFIG.atributos.find(a => a.key === attrKey);

  const sharedCol = document.getElementById('attr-shared');
  const unsharedCol = document.getElementById('attr-unshared');
  sharedCol.innerHTML = '';
  unsharedCol.innerHTML = '';

  // Classify heroes
  const shared = [];
  const unshared = [];

  CONFIG.superheroes.forEach(hero => {
    if (heroMatchesAttr(hero, attrKey, attrValue)) {
      shared.push(hero);
    } else {
      unshared.push(hero);
    }
  });

  // Column titles
  const sharedTitle = document.createElement('div');
  sharedTitle.className = 'attr-column-title';
  sharedTitle.innerHTML = `
    <span class="material-symbols-outlined filled" style="color:${attr.color};font-size:20px">${attr.icon}</span>
    ALIADOS (${shared.length})
  `;
  sharedCol.appendChild(sharedTitle);

  const unsharedTitle = document.createElement('div');
  unsharedTitle.className = 'attr-column-title';
  unsharedTitle.innerHTML = `
    <span class="material-symbols-outlined" style="color:#8f6f6d;font-size:20px">block</span>
    RIVALES (${unshared.length})
  `;
  unsharedCol.appendChild(unsharedTitle);

  // Render shared cards
  shared.forEach((hero, idx) => {
    const card = buildCollapsedCardForAttr(hero, attr, idx);
    sharedCol.appendChild(card);
  });

  // Render unshared (rival) cards — negative reveal style
  unshared.forEach((hero, idx) => {
    const card = buildCollapsedCardForAttr(hero, attr, idx);
    card.style.filter = 'invert(100%)';
    unsharedCol.appendChild(card);
  });
}

function buildCollapsedCardForAttr(hero, contextAttr, idx) {
  const container = document.createElement('div');
  container.className = 'card-container';
  container.style.animationDelay = `${idx * 0.05 + 0.05}s`;

  const flipper = document.createElement('div');
  flipper.className = 'card-flipper';

  // Back
  flipper.appendChild(buildCardBack(idx));

  // Front with contextual attribute
  flipper.appendChild(buildCollapsedFront(hero, contextAttr));

  container.appendChild(flipper);

  // Start flipped (showing front)
  container.classList.add('flipped');

  // Click opens overlay
  container.addEventListener('click', () => {
    openOverlay(hero.id);
  });

  return container;
}

function heroMatchesAttr(hero, attrKey, attrValue) {
  const normalizedTarget = attrValue.toLowerCase().trim();

  if (attrKey === 'camara') {
    return hero.camara.name.toLowerCase().trim() === normalizedTarget;
  }

  if (attrKey === 'comidas') {
    const heroComidas = hero.comidas || [];
    return heroComidas.some(c => {
      const name = typeof c === 'object' ? c.name : c;
      const heroBase = extractComidaBase(name.toLowerCase().trim());
      return heroBase === extractComidaBase(normalizedTarget) || name.toLowerCase().trim().includes(extractComidaBase(normalizedTarget));
    });
  }

  // General array match — handle both object and string items
  const values = hero[attrKey] || [];
  return values.some(v => {
    const name = typeof v === 'object' ? v.name : v;
    return name.toLowerCase().trim() === normalizedTarget;
  });
}

function extractComidaBase(value) {
  // "milanesa con puré" → "milanesa"
  // "milanesa con papas fritas" → "milanesa"
  // "sanguches de miga" → "sanguches de miga" (no "con")
  const conIndex = value.indexOf(' con ');
  if (conIndex !== -1) {
    return value.substring(0, conIndex).trim();
  }
  return value;
}

// ============================================
// P04: SUPERHEROE
// ============================================

function renderSuperheroe() {
  const nav = getCurrentNav();
  const hero = CONFIG.superheroes.find(h => h.id === nav.params.heroId);
  if (!hero) return;

  slideshowIndex = 0;

  // Left column: details (same as expanded card but no overlay)
  const details = document.getElementById('hero-details');
  details.innerHTML = '';
  const card = buildExpandedCardInline(hero);
  details.appendChild(card);

  // Right column: slideshow
  const photos = document.getElementById('hero-photos');
  photos.innerHTML = '';
  const slideshow = buildSlideshow(hero);
  photos.appendChild(slideshow);

  // Footer: thumbnails of other heroes
  const thumbs = document.getElementById('hero-thumbnails');
  thumbs.innerHTML = '';
  CONFIG.superheroes.forEach(other => {
    if (other.id === hero.id) return;
    const thumb = document.createElement('div');
    thumb.className = 'hero-thumb';
    thumb.addEventListener('click', () => {
      // Replace current screen (don't push)
      navStack[navStack.length - 1] = { screen: 'superheroe', params: { heroId: other.id } };
      renderScreen();
    });

    const imgDiv = document.createElement('div');
    imgDiv.className = 'hero-thumb-img';
    if (other.avatar) {
      imgDiv.innerHTML = `<img src="${other.avatar}" alt="${other.nombre}" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      imgDiv.innerHTML = '<span class="material-symbols-outlined">person</span>';
    }
    thumb.appendChild(imgDiv);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'hero-thumb-name';
    nameDiv.textContent = other.nombre;
    thumb.appendChild(nameDiv);

    thumbs.appendChild(thumb);
  });
}

function buildExpandedCardInline(hero) {
  // Same as buildExpandedCard but for inline use (no overlay-specific behavior)
  const card = document.createElement('div');
  card.style.border = '4px solid #1c1b1b';
  card.style.borderRadius = '1rem';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '6px 6px 0 0 rgba(0,0,0,1)';
  card.style.background = '#ffffff';

  // Header
  const header = document.createElement('div');
  header.className = 'expanded-header';

  const name = document.createElement('span');
  name.className = 'expanded-name';
  name.textContent = hero.nombre;
  name.addEventListener('click', () => {}); // Already on this hero's page
  header.appendChild(name);

  const cameraBadge = document.createElement('span');
  cameraBadge.className = 'expanded-camera-badge';
  cameraBadge.textContent = hero.camara.name.toUpperCase();
  cameraBadge.addEventListener('click', () => navigateToAtributo('camara', hero.camara.name));
  header.appendChild(cameraBadge);

  card.appendChild(header);

  // Photo (smaller inline)
  const photo = document.createElement('div');
  photo.style.aspectRatio = '3/2';
  photo.style.borderBottom = '4px solid #1c1b1b';
  photo.style.overflow = 'hidden';
  photo.style.position = 'relative';
  if (hero.avatar) {
    photo.innerHTML = `<img src="${hero.avatar}" alt="${hero.nombre}" style="width:100%;height:100%;object-fit:cover"><div class="halftone" style="position:absolute;inset:0;pointer-events:none"></div>`;
  } else {
    photo.innerHTML = `
      <div class="expanded-photo-placeholder">
        <span class="material-symbols-outlined">photo_camera</span>
      </div>
    `;
  }
  card.appendChild(photo);

  // Poder Especial
  const special = document.createElement('div');
  special.className = 'expanded-special';

  const specHeader = document.createElement('div');
  specHeader.className = 'expanded-special-header';

  specHeader.innerHTML = `
    <div class="expanded-special-icon">
      <span class="material-symbols-outlined filled">auto_fix_high</span>
    </div>
    <span class="expanded-special-label">PODER ESPECIAL</span>
  `;
  special.appendChild(specHeader);

  const specValueBox = document.createElement('div');
  specValueBox.className = 'expanded-special-value-box';
  hero.poder_especial.forEach(val => {
    const span = document.createElement('span');
    span.textContent = val.toUpperCase();
    span.style.cursor = 'pointer';
    span.style.marginRight = '8px';
    span.addEventListener('click', () => navigateToAtributo('poder_especial', val));
    specValueBox.appendChild(span);
  });
  special.appendChild(specValueBox);
  card.appendChild(special);

  // Attributes
  const attrs = document.createElement('div');
  attrs.className = 'expanded-attrs';

  const displayAttrs = CONFIG.atributos.filter(a => a.key !== 'camara' && a.key !== 'poder_especial');

  displayAttrs.forEach(attr => {
    const row = document.createElement('div');
    row.className = 'expanded-attr-row';

    row.innerHTML = `
      <div class="expanded-attr-icon-box" style="background:${attr.color}">
        <span class="material-symbols-outlined filled">${attr.icon}</span>
      </div>
    `;

    const content = document.createElement('div');
    content.className = 'expanded-attr-content';

    const label = document.createElement('div');
    label.className = 'expanded-attr-label';
    label.textContent = attr.label;
    content.appendChild(label);

    const tags = document.createElement('div');
    tags.className = 'expanded-attr-tags';

    const values = getHeroAttrValue(hero, attr.key);
    values.forEach(val => {
      const tag = document.createElement('span');
      tag.className = 'attr-tag';
      tag.textContent = val;
      tag.style.background = attr.containerColor;
      tag.style.color = attr.onContainerColor;
      tag.addEventListener('click', () => navigateToAtributo(attr.key, val));
      tags.appendChild(tag);
    });

    content.appendChild(tags);
    row.appendChild(content);
    attrs.appendChild(row);
  });

  card.appendChild(attrs);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'expanded-footer';
  card.appendChild(footer);

  return card;
}

// ============================================
// SLIDESHOW
// ============================================

function buildSlideshow(hero) {
  const container = document.createElement('div');
  container.className = 'slideshow';
  container.id = 'slideshow-container';

  const photoWrapper = document.createElement('div');
  photoWrapper.className = 'slideshow-photo';
  photoWrapper.id = 'slideshow-photo';

  if (hero.fotos && hero.fotos.length > 0) {
    renderSlideshowPhoto(hero);
  } else {
    photoWrapper.innerHTML = `
      <div class="slideshow-placeholder">
        <span class="material-symbols-outlined">photo_camera</span>
        <span>Sin fotos</span>
      </div>
    `;
  }

  container.appendChild(photoWrapper);

  // Navigation arrows (only if photos exist)
  if (hero.fotos && hero.fotos.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slideshow-nav prev';
    prevBtn.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>';
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); slideshowPrev(); });
    container.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slideshow-nav next';
    nextBtn.innerHTML = '<span class="material-symbols-outlined">arrow_forward</span>';
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); slideshowNext(); });
    container.appendChild(nextBtn);
  }

  // Dots & counter
  if (hero.fotos && hero.fotos.length > 0) {
    const dots = document.createElement('div');
    dots.className = 'slideshow-dots';
    dots.id = 'slideshow-dots';

    hero.fotos.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        slideshowIndex = i;
        renderSlideshowPhoto(hero);
      });
      dots.appendChild(dot);
    });

    container.appendChild(dots);

    const counter = document.createElement('div');
    counter.className = 'slideshow-counter';
    counter.id = 'slideshow-counter';
    counter.textContent = `1/${hero.fotos.length}`;
    container.appendChild(counter);
  }

  return container;
}

function renderSlideshowPhoto(hero) {
  if (!hero.fotos || hero.fotos.length === 0) return;

  const photoWrapper = document.getElementById('slideshow-photo');
  if (!photoWrapper) return;

  const url = hero.fotos[slideshowIndex];
  photoWrapper.innerHTML = `
    <img src="${url}" alt="${hero.nombre} - foto ${slideshowIndex + 1}" style="width:100%;height:100%;object-fit:cover">
    <div class="halftone" style="position:absolute;inset:0;z-index:1;pointer-events:none"></div>
  `;

  // Update dots
  const dots = document.getElementById('slideshow-dots');
  if (dots) {
    dots.querySelectorAll('.slideshow-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === slideshowIndex);
    });
  }

  // Update counter
  const counter = document.getElementById('slideshow-counter');
  if (counter) {
    counter.textContent = `${slideshowIndex + 1}/${hero.fotos.length}`;
  }
}

function slideshowPrev() {
  const nav = getCurrentNav();
  if (nav.screen !== 'superheroe') return;
  const hero = CONFIG.superheroes.find(h => h.id === nav.params.heroId);
  if (!hero || !hero.fotos || hero.fotos.length <= 1) return;

  slideshowIndex = (slideshowIndex - 1 + hero.fotos.length) % hero.fotos.length;
  renderSlideshowPhoto(hero);
}

function slideshowNext() {
  const nav = getCurrentNav();
  if (nav.screen !== 'superheroe') return;
  const hero = CONFIG.superheroes.find(h => h.id === nav.params.heroId);
  if (!hero || !hero.fotos || hero.fotos.length <= 1) return;

  slideshowIndex = (slideshowIndex + 1) % hero.fotos.length;
  renderSlideshowPhoto(hero);
}
