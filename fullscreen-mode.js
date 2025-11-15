(function() {
  // --- Configuration ---
  const BUTTON_ID = 'ds-fullscreen-toggle-btn';
  const BUTTON_CONTAINER_SELECTOR = '.ds-video-section__actions';
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
    btn.id = BUTTON_ID;
    btn.className = 'btn ds-button ds-button--muted';
    btn.setAttribute('aria-label', 'In-Window Fullscreen (ESC to exit)');
    btn.title = 'In-Window Fullscreen (ESC to exit)';

    // Create a 14x14 SVG fullscreen icon and append it to the button
    try {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '14');
      svg.setAttribute('height', '14');
      // Use a 14x14 viewBox and draw bold corner strokes for a fullscreen icon
      svg.setAttribute('viewBox', '0 0 14 14');
      svg.setAttribute('aria-hidden', 'true');

      // Create four corner paths with bold strokes (stroke uses currentColor)
      const makeCorner = (d) => {
        const p = document.createElementNS(svgNS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', 'currentColor');
        p.setAttribute('stroke-width', '2.4');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');
        return p;
      };

      // Top-left corner
      svg.appendChild(makeCorner('M4 1 L1 1 L1 4'));
      // Top-right corner
      svg.appendChild(makeCorner('M10 1 L13 1 L13 4'));
      // Bottom-left corner
      svg.appendChild(makeCorner('M1 10 L1 13 L4 13'));
      // Bottom-right corner
      svg.appendChild(makeCorner('M10 13 L13 13 L13 10'));

      btn.appendChild(svg);
    } catch (err) {
      // Fallback: use a simple glyph if SVG creation fails
      btn.textContent = '⤢';
    }

    btn.addEventListener('click', () => {
      // Enter fullscreen (do not auto-exit on click; user should press ESC)
      if (!isFullscreen) {
        enterFullscreen();
      } else {
        // Allow clicking the button to also exit as a convenience
        exitFullscreen();
      }
    });

    // Try to insert to the right of the widescreen button if it exists
    const wideBtn = document.getElementById('ds-widescreen-toggle-btn');
    if (wideBtn && wideBtn.parentNode === container) {
      // Insert after wideBtn
      if (wideBtn.nextSibling) {
        container.insertBefore(btn, wideBtn.nextSibling);
      } else {
        container.appendChild(btn);
      }
    } else {
      // Fallback: append at the end
      container.appendChild(btn);
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
