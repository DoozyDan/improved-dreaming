(function() {
  // --- Configuration ---
  
  // ID for our new button
  const BUTTON_ID = 'ds-widescreen-toggle-btn';
  
  // LocalStorage key to remember the setting
  const STORAGE_KEY = 'dsWidescreenEnabled';

  // Target the Shaka player controls panel so the button appears inline
  // with the player's other control buttons (play, mute, fullscreen, etc.).
  const BUTTON_CONTAINER_SELECTOR = '.shaka-controls-button-panel';
  
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


  function updateButtonIcon(buttonElement, isWide) {
    if (!buttonElement) return;
    // Clear existing contents
    while (buttonElement.firstChild) buttonElement.removeChild(buttonElement.firstChild);

    // Use material icons for the button 
    buttonElement.textContent = 'fit_screen';

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

      // Create the new button and style it like the other Shaka controls
      const newButton = document.createElement('button');
      newButton.type = 'button';
      newButton.id = BUTTON_ID;
      newButton.className = 'material-icons-round shaka-tooltip shaka-no-propagation';
      newButton.setAttribute('aria-label', 'Toggle widescreen');
      newButton.title = 'Toggle widescreen';

      // Add the click listener
      newButton.addEventListener('click', toggleWideMode);

      // Try to insert near the existing fullscreen button if present
      const shakaFs = buttonContainer.querySelector('.shaka-fullscreen-button');
      if (shakaFs && shakaFs.parentNode === buttonContainer) {
        buttonContainer.insertBefore(newButton, shakaFs); // insert before native fullscreen
      } else {
        buttonContainer.appendChild(newButton);
      }

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