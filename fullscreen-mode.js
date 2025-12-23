(function() {
  // --- Configuration ---
  const BUTTON_ID = 'ds-fullscreen-toggle-btn';
  // Insert in the Shaka player controls panel so the button sits with other controls
  const BUTTON_CONTAINER_SELECTOR = '.shaka-controls-button-panel';
  const EMBED_SELECTOR = '.ds-video-section__embed';

  // --- State ---
  let initInterval = null;
  let isFullscreen = false;
  let escHandler = null;

  /**
   * Applies the requested fullscreen styles to the embed element.
   */
  function applyFullscreenStyles(embedEl) {
    if (!embedEl) return;
    embedEl.style.position = 'fixed';
    embedEl.style.zIndex = '999';
    embedEl.style.top = '0';
    embedEl.style.left = '0';
    embedEl.style.height = '100vh';
    embedEl.style.display = 'flex';
  }

  /**
   * Reverts the embed element styles to the specified minimal rule.
   */
  function revertFullscreenStyles(embedEl) {
    if (!embedEl) return;
    embedEl.style.position = '';
    embedEl.style.zIndex = '';
    embedEl.style.top = '';
    embedEl.style.left = '';
    embedEl.style.height = '';
    embedEl.style.display = '';
  }

  /**
   * Enter fullscreen mode and install ESC handler to exit.
   */
  function enterFullscreen() {
    const embedEl = document.querySelector(EMBED_SELECTOR);
    if (!embedEl) return;

    applyFullscreenStyles(embedEl);
    isFullscreen = true;

    // Create the ESC handler
    escHandler = function(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', escHandler);
  }

  /**
   * Exit fullscreen and remove ESC handler.
   */
  function exitFullscreen() {
    const embedEl = document.querySelector(EMBED_SELECTOR);
    if (embedEl) {
      revertFullscreenStyles(embedEl);
    }
    isFullscreen = false;
    if (escHandler) {
      window.removeEventListener('keydown', escHandler);
      escHandler = null;
    }
  }

  /**
   * Injects the fullscreen button next to the widescreen button (to its right).
   */
  function injectButton(container) {
    if (!container) return;
    if (document.getElementById(BUTTON_ID)) return; // already present

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = BUTTON_ID;
    // Use Shaka control classes so it appears inline with other player buttons
    btn.className = 'material-icons-round shaka-tooltip shaka-no-propagation';
    btn.setAttribute('aria-label', 'In-Window Fullscreen (ESC to exit)');
    btn.title = 'In-Window Fullscreen (ESC to exit)';
    btn.textContent = 'screenshot_monitor';

    btn.addEventListener('click', () => {
      // Enter in-window fullscreen or exit if already active
      if (!isFullscreen) {
        enterFullscreen();
      } else {
        exitFullscreen();
      }
    });

    // Try to insert to the right of the widescreen button if it exists
    // Prefer inserting next to our widescreen button, otherwise near the native fullscreen
    const wideBtn = document.getElementById('ds-widescreen-toggle-btn');
    if (wideBtn && wideBtn.parentNode === container) {
      container.insertBefore(btn, wideBtn.nextSibling || null);
    } else {
      const shakaFs = container.querySelector('.shaka-fullscreen-button');
      if (shakaFs && shakaFs.parentNode === container) {
        container.insertBefore(btn, shakaFs.nextSibling || null);
      } else {
        container.appendChild(btn);
      }
    }
  }

  /**
   * Polls for the button container and injects the button, and sets up cleanup on navigate.
   */
  function initFullscreen() {
    if (initInterval) clearInterval(initInterval);

    let attempts = 0;
    const maxAttempts = 40; // 20 seconds

    initInterval = setInterval(() => {
      attempts++;
      const container = document.querySelector(BUTTON_CONTAINER_SELECTOR);

      if (container) {
        clearInterval(initInterval);
        initInterval = null;
        injectButton(container);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(initInterval);
        initInterval = null;
      }
    }, 500);
  }

  // --- Main Execution ---

  // 1) Listen for SPA navigation events
  window.addEventListener('ds-page-updated', (event) => {
    if (event.detail.href.includes('/watch?')) {
      initFullscreen();
    } else {
      // Navigated away - cleanup
      if (initInterval) {
        clearInterval(initInterval);
        initInterval = null;
      }
      if (isFullscreen) exitFullscreen();
      const btn = document.getElementById(BUTTON_ID);
      if (btn) btn.remove();
    }
  });

  // 2) Run once on initial load
  if (document.location.href.includes('/watch?')) {
    initFullscreen();
  }

})();
