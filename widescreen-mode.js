(function() {
  // --- Configuration ---
  
  // ID for our new button
  const BUTTON_ID = 'ds-widescreen-toggle-btn';
  
  // LocalStorage key to remember the setting
  const STORAGE_KEY = 'dsWidescreenEnabled';

  // *** IMPORTANT ***
  // This is a GUESS for the container holding the "Share" and "Download" buttons.
  // If the button doesn't show up, you need to find the right selector.
  // Right-click the "Share" button, click "Inspect", and find the
  // class name of its parent container, then paste it here.
  const BUTTON_CONTAINER_SELECTOR = '.ds-video-section__actions';
  
  // --- End Configuration ---

  let initInterval = null;

  /**
   * Applies the wide or standard style to the page.
   * Also updates the button text.
   * @param {boolean} isWide - True to enable widescreen, false for standard.
   */
  function applyWideMode(isWide) {
    const pageElement = document.querySelector('.ds-page.ds-watch-page');
    const buttonElement = document.getElementById(BUTTON_ID);

    if (pageElement) {
      // Set to 'none' for wide, or '' (empty) to reset to default CSS.
      pageElement.style.maxWidth = isWide ? 'none' : '';
    }
    if (buttonElement) {
      // Update button icon to reflect the *next* action (use SVGs instead of text)
      updateButtonIcon(buttonElement, isWide);
    }
  }

  /**
   * Create a 14x14 SVG based on the provided full-size (24x24) path data.
   * We use the two provided monitor-style SVG paths and scale them down via viewBox.
   * When `isWide` is true we show the first icon; otherwise the second.
   */
  function createWidescreenSvg(isWide) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    // Keep the original 24x24 viewBox so the provided path data scales correctly
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    // Path data from the two SVGs.
    const PATH_A = 'm21.36771,2.423l-0.2,-0.01l-18,0l-0.21,0.01c-0.49,0.05 -0.95,0.28 -1.28,0.64c-0.33,0.37 -0.52,0.85 -0.51,1.35l0,14l0.01,0.2c0.04,0.46 0.25,0.88 0.57,1.21c0.33,0.32 0.75,0.53 1.21,0.58l0.21,0.01l18,0l0.2,-0.02c0.46,-0.04 0.88,-0.25 1.21,-0.57c0.32,-0.33 0.53,-0.75 0.58,-1.21l0.01,-0.2l0,-14c0,-0.5 -0.19,-0.98 -0.52,-1.35c-0.33,-0.36 -0.79,-0.59 -1.28,-0.64zm-18.24193,15.84744l0.04193,-13.85744l18,0l-0.04193,13.71908l-18,0.13836zm13.74421,-10.16679l-0.01,0l-0.07,0.07l-3.21,3.21l3.21,3.2c0.09,0.1 0.2,0.17 0.32,0.23c0.12,0.05 0.26,0.08 0.39,0.08c0.13,0 0.26,-0.03 0.39,-0.08c0.12,-0.05 0.23,-0.12 0.32,-0.22c0.1,-0.09 0.17,-0.2 0.22,-0.32c0.05,-0.13 0.08,-0.26 0.08,-0.39c0,-0.13 -0.03,-0.27 -0.08,-0.39c-0.06,-0.12 -0.13,-0.23 -0.23,-0.32l-1.79,-1.79l1.79,-1.8l0.07,-0.07c0.15,-0.2 0.23,-0.44 0.22,-0.68c-0.02,-0.25 -0.12,-0.48 -0.29,-0.66c-0.18,-0.17 -0.41,-0.27 -0.65,-0.29c-0.25,-0.01 -0.49,0.07 -0.68,0.22zm-11.08,0.07c-0.19,0.19 -0.29,0.44 -0.29,0.71c0,0.26 0.1,0.51 0.29,0.7l1.79,1.8l-1.79,1.79l-0.07,0.07c-0.15,0.2 -0.23,0.44 -0.22,0.68c0.01,0.25 0.12,0.48 0.29,0.66c0.18,0.17 0.41,0.28 0.66,0.29c0.24,0.01 0.48,-0.07 0.68,-0.22l0.07,-0.07l3.21,-3.2l-3.21,-3.21c-0.19,-0.19 -0.44,-0.29 -0.7,-0.29c-0.27,0 -0.52,0.1 -0.71,0.29z';
    const PATH_B = 'm21.2,3.01l-0.2,-0.01l-18,0l-0.21,0.01c-0.49,0.05 -0.95,0.28 -1.28,0.64c-0.33,0.37 -0.52,0.85 -0.51,1.35l0,14l0.01,0.2c0.04,0.46 0.25,0.88 0.57,1.21c0.33,0.32 0.75,0.53 1.21,0.58l0.21,0.01l18,0l0.2,-0.02c0.46,-0.04 0.88,-0.25 1.21,-0.57c0.32,-0.33 0.53,-0.75 0.58,-1.21l0.01,-0.2l0,-14c0,-0.5 -0.19,-0.98 -0.52,-1.35c-0.33,-0.36 -0.79,-0.59 -1.28,-0.64zm-18.2,15.8274l0,-13.8374l18,0l0,13.8374l-18,0zm4.77244,-10.13366l-0.08,0.07l-3.21,3.21l3.21,3.2c0.09,0.1 0.2,0.17 0.32,0.23c0.12,0.05 0.26,0.08 0.39,0.08c0.13,0 0.26,-0.03 0.39,-0.08c0.12,-0.05 0.23,-0.12 0.32,-0.22c0.1,-0.09 0.17,-0.2 0.22,-0.32c0.05,-0.13 0.08,-0.26 0.08,-0.39c0,-0.13 -0.03,-0.27 -0.08,-0.39c-0.06,-0.12 -0.13,-0.23 -0.23,-0.32l-1.79,-1.79l1.79,-1.8l0.07,-0.07c0.15,-0.2 0.23,-0.44 0.21,-0.68c-0.01,-0.25 -0.12,-0.48 -0.29,-0.65c-0.17,-0.17 -0.4,-0.28 -0.65,-0.29c-0.24,-0.02 -0.48,0.06 -0.67,0.21zm6.92,0.07c-0.19,0.19 -0.29,0.44 -0.29,0.71c0,0.26 0.1,0.51 0.29,0.7l1.79,1.8l-1.79,1.79l-0.07,0.07c-0.15,0.2 -0.23,0.44 -0.22,0.68c0.01,0.25 0.12,0.48 0.29,0.66c0.18,0.17 0.41,0.28 0.66,0.29c0.24,0.01 0.48,-0.07 0.68,-0.22l0.07,-0.07l3.21,-3.2l-3.21,-3.21c-0.19,-0.19 -0.44,-0.29 -0.7,-0.29c-0.27,0 -0.52,0.1 -0.71,0.29z';

    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', isWide ? PATH_A : PATH_B);
    // Use black fill when in widescreen mode, otherwise use black as well per request
    p.setAttribute('fill', 'rgb(39, 45, 55)');
    svg.appendChild(p);

    return svg;
  }

  function updateButtonIcon(buttonElement, isWide) {
    if (!buttonElement) return;
    // Clear existing contents
    while (buttonElement.firstChild) buttonElement.removeChild(buttonElement.firstChild);

    try {
      // Show icon corresponding to current state (smaller black version)
      const svg = createWidescreenSvg(isWide);
      buttonElement.appendChild(svg);
    } catch (err) {
      // Fallback to text if SVG creation fails
      buttonElement.textContent = isWide ? '-><-' : '<->';
    }

    // Accessibility — button toggles widescreen, so label advises the action
    buttonElement.setAttribute('aria-label', isWide ? 'Disable Widescreen' : 'Enable Widescreen');
    buttonElement.title = isWide ? 'Disable Widescreen' : 'Enable Widescreen';
  }

  /**
   * Reads the current preference, inverts it, saves it, and applies the new style.
   */
  function toggleWideMode() {
    // Get current state, defaulting to 'true' (widescreen on) if it's never been set.
    let isWide = localStorage.getItem(STORAGE_KEY);
    if (isWide === null) {
      isWide = true;
    } else {
      isWide = isWide === 'true';
    }

    // Invert the state
    const newIsWide = !isWide;
    
    // Save and apply
    localStorage.setItem(STORAGE_KEY, newIsWide);
    applyWideMode(newIsWide);
  }

  /**
   * Polls the page to find the button container and injects the toggle button.
   * Also sets the initial widescreen state from localStorage.
   */
  function initWidescreen() {
    // Clear any previous interval
    if (initInterval) clearInterval(initInterval);

    initInterval = setInterval(() => {
      const buttonContainer = document.querySelector(BUTTON_CONTAINER_SELECTOR);
      const pageElement = document.querySelector('.ds-page.ds-watch-page');

      // Wait until both the page and the button bar are loaded
      if (!buttonContainer || !pageElement) {
        return; // Keep polling
      }

      // We found the elements, stop polling
      clearInterval(initInterval);
      initInterval = null;

      // Check if button already exists
      if (document.getElementById(BUTTON_ID)) {
        return;
      }

      // Create the new button
      const newButton = document.createElement('button');
      newButton.id = BUTTON_ID;
      
      // Copy styling from the site's buttons (this is a guess from other pages)
      newButton.className = 'btn ds-button ds-button--muted';
      
      // Add the click listener
      newButton.addEventListener('click', toggleWideMode);

      // Add the button to the left of the other buttons
      buttonContainer.append(newButton);

      // Get the saved preference and apply it
      // Default to 'true' (widescreen on) if it's the first time
      let isWide = localStorage.getItem(STORAGE_KEY);
      if (isWide === null) {
        isWide = true;
        localStorage.setItem(STORAGE_KEY, isWide);
      } else {
        isWide = isWide === 'true';
      }

      // Apply the initial state
      applyWideMode(isWide);

    }, 500); // Check every 500ms
    
    // Safety stop after 20 seconds
    setTimeout(() => {
      if (initInterval) clearInterval(initInterval);
    }, 20000);
  }

  // --- Main Execution ---

  // 1. Add listener for page navigations
  window.addEventListener('ds-page-updated', (event) => {
    // Check if the new URL is the one we care about
    if (event.detail.href.includes("/watch?")) {
      initWidescreen();
    } else {
      // Navigated away, clear any running polls
      if (initInterval) clearInterval(initInterval);
    }
  });

  // 2. Run once on initial load (in case we're already on the right page)
  if (document.location.href.includes("/watch?")) {
    initWidescreen();
  }
})();