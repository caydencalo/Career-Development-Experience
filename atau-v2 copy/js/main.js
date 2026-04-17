/* ============================================================
   main.js file contains everything that makes the site interactive. It handles 
   switching between pages when the user clicks on a link, opening/closing the 
   mobile menu, highlighting the donation amount you select, and showing a 
   confirmation message when the referral form is submitted.
   ============================================================ */

/* ── Page Navigation ── */

/**
 * Show a page by ID, hide all others, scroll to top.
 * @param {string} id - page key (e.g. 'home', 'about', 'brotherhood')
 */
function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  var target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeMobileNav();
}

/* ── Mobile Navigation ── */

/**
 * Toggle the mobile nav drawer open/closed.
 * @param {HTMLElement} btn - the hamburger button
 */
function toggleNav(btn) {
  var nav = document.getElementById('nav-links');
  btn.setAttribute('aria-expanded', nav.classList.toggle('open'));
}

/**
 * Close mobile nav (called after any navigation action).
 */
function closeMobileNav() {
  var nav = document.getElementById('nav-links');
  nav.classList.remove('open');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

/* ── Donation Widget ── */

/**
 * Set active donation amount button.
 * @param {HTMLElement} btn - clicked amount button
 */
function setAmount(btn) {
  document.querySelectorAll('.donate-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
}

/**
 * Set active donation frequency tab.
 * @param {HTMLElement} btn - clicked type button
 */
function setType(btn) {
  document.querySelectorAll('.type-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
}

/* ── Referral Form ── */

/**
 * Handle referral form submission.
 * Replace with real backend/email integration as needed.
 */
function handleReferral() {
  var name = document.getElementById('cand-name').value.trim();
  if (!name) {
    alert("Please enter the candidate's name.");
    return;
  }
  document.getElementById('refer-success').style.display = 'block';
  document.querySelector('[onclick="handleReferral()"]').disabled = true;
}

/* ── Brother Card Expand/Collapse ── */

/**
 * Toggle a brother card open or closed.
 * When opened, the card spans the full grid row (horizontal expansion).
 * Only one card can be open at a time.
 * @param {HTMLElement} card - the clicked brother-card element
 */
function toggleCard(card) {
  var isOpen = card.classList.contains('open');

  // Close all open cards
  document.querySelectorAll('.brother-card.open').forEach(function(c) {
    c.classList.remove('open');
    c.setAttribute('aria-expanded', 'false');
  });

  // If it wasn't open, open it and scroll it into view
  if (!isOpen) {
    card.classList.add('open');
    card.setAttribute('aria-expanded', 'true');
    setTimeout(function() {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
}

/* ── Archive Carousels ── */

/**
 * Initialize all carousels on the page — builds dot indicators.
 * Called once on DOMContentLoaded.
 */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(function(carousel) {
    var slides = carousel.querySelectorAll('.carousel-slide');
    var dotsContainer = carousel.querySelector('.carousel-dots');
    if (!dotsContainer) return;

    slides.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
      dot.onclick = function() { carouselGoTo(carousel.id, i); };
      dotsContainer.appendChild(dot);
    });
  });
}

/**
 * Get the current active slide index for a carousel.
 * @param {string} id - carousel element ID
 */
function carouselCurrentIndex(id) {
  var carousel = document.getElementById(id);
  var slides = carousel.querySelectorAll('.carousel-slide');
  for (var i = 0; i < slides.length; i++) {
    if (slides[i].classList.contains('active')) return i;
  }
  return 0;
}

/**
 * Navigate to a specific slide.
 * Also syncs per-slide captions for the album carousel.
 * @param {string} id - carousel element ID
 * @param {number} index - target slide index
 */
function carouselGoTo(id, index) {
  var carousel = document.getElementById(id);
  var slides = carousel.querySelectorAll('.carousel-slide');
  var dots = carousel.querySelectorAll('.carousel-dot');

  slides.forEach(function(s) { s.classList.remove('active'); });
  dots.forEach(function(d) { d.classList.remove('active'); });

  var target = (index + slides.length) % slides.length;
  slides[target].classList.add('active');
  if (dots[target]) dots[target].classList.add('active');

  // Sync album captions if this is the album carousel
  if (id === 'carousel-album') {
    var captions = document.querySelectorAll('#album-captions .album-caption');
    captions.forEach(function(c) { c.classList.remove('active'); });
    if (captions[target]) captions[target].classList.add('active');
  }
}

/**
 * Go to the previous slide.
 * @param {string} id - carousel element ID
 */
function carouselPrev(id) {
  carouselGoTo(id, carouselCurrentIndex(id) - 1);
}

/**
 * Go to the next slide.
 * @param {string} id - carousel element ID
 */
function carouselNext(id) {
  carouselGoTo(id, carouselCurrentIndex(id) + 1);
}

document.addEventListener('DOMContentLoaded', initCarousels);

/* ── Lightbox ── */

// Tracks which carousel is open in the lightbox and current index
var _lightboxCarouselId = null;
var _lightboxIndex = 0;

/**
 * Open the lightbox showing the clicked photo.
 * Collects all sibling photos in the same carousel for prev/next.
 * @param {HTMLElement} img - the clicked carousel-photo img element
 */
function openLightbox(img) {
  var slide = img.closest('.carousel-slide');
  var carousel = img.closest('.carousel');
  _lightboxCarouselId = carousel ? carousel.id : null;

  // Find index of this slide among all slides in carousel
  var slides = carousel ? carousel.querySelectorAll('.carousel-slide') : [slide];
  _lightboxIndex = 0;
  for (var i = 0; i < slides.length; i++) {
    if (slides[i] === slide) { _lightboxIndex = i; break; }
  }

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the lightbox.
 */
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Navigate to the previous photo in the lightbox.
 */
function lightboxPrev(e) {
  e.stopPropagation();
  lightboxNavigate(-1);
}

/**
 * Navigate to the next photo in the lightbox.
 */
function lightboxNext(e) {
  e.stopPropagation();
  lightboxNavigate(1);
}

/**
 * Move by direction (+1 or -1) through the carousel photos.
 * @param {number} dir - +1 for next, -1 for prev
 */
function lightboxNavigate(dir) {
  if (!_lightboxCarouselId) return;
  var carousel = document.getElementById(_lightboxCarouselId);
  if (!carousel) return;
  var slides = carousel.querySelectorAll('.carousel-slide');
  _lightboxIndex = (_lightboxIndex + dir + slides.length) % slides.length;
  var img = slides[_lightboxIndex].querySelector('img.carousel-photo');
  if (img) {
    var lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    // Also sync the carousel to this slide
    carouselGoTo(_lightboxCarouselId, _lightboxIndex);
  }
}

// Close lightbox on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev(e);
  if (e.key === 'ArrowRight') lightboxNext(e);
});

/* ── Archive Extras Flipper (See More / Back) ── */

/**
 * Show the extras (video) view for a flipper — hides photos/text.
 * @param {Event} e - click event
 * @param {string} flipperId - ID of the archive-flipper element
 */
function showExtras(e, panelId) {
  e.preventDefault();
  var panel = document.getElementById(panelId);
  panel.style.setProperty('display', 'block', 'important');
  panel.querySelector('.archive-extras-row').style.cssText = 'display:flex !important; flex-direction:row !important; flex-wrap:nowrap !important; gap:1rem; align-items:flex-start;';
  panel.classList.add('visible');
  setTimeout(function() {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

/**
 * Hide the extras panel and scroll back to the entry.
 * @param {Event} e - click event
 * @param {string} panelId - ID of the archive-extras-panel element
 */
function hideExtras(e, panelId) {
  e.preventDefault();
  var panel = document.getElementById(panelId);
  panel.querySelectorAll('video').forEach(function(v) { v.pause(); });
  panel.classList.remove('visible');
  panel.style.setProperty('display', 'none', 'important');
  setTimeout(function() {
    var prev = panel.previousElementSibling;
    (prev || panel.parentElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
