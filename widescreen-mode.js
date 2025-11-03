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
      // Update button text to reflect the *next* action.
      buttonElement.textContent = isWide ? '-><-' : '<->';
    }
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