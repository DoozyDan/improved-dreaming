// A unique ID for our new title element
const RUNTIME_TITLE_ID = 'ds-total-runtime-h4';
let listObserver = null;

/**
 * Calculates the total time from all video cards on the page.
 * @returns {string|null} A formatted "HH:MM:SS" string or null if not found.
 */
function calculateTotalTime() {
  let totalSeconds = 0;
  // Look for the main page container instead of the old carousel
  const pageContainer = document.querySelector('.ds-my-list-videos-page');
  if (!pageContainer) return null;

  // Find all duration spans within that page
  const durationElements = pageContainer.querySelectorAll('.ds-video-thumbnail__badge--watched-duration span');
  if (durationElements.length === 0) return null;

  durationElements.forEach(span => {
    const timeString = span.textContent.trim();
    const parts = timeString.split(':');
    
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        totalSeconds += (minutes * 60) + seconds;
      }
    }
    else if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        totalSeconds += (hours * 3600) + (minutes * 60) + seconds;
      }
    }
  });

  if (totalSeconds === 0) return null;

  const totalHours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const formattedHours = totalHours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Creates, inserts, or updates the h4 title element with the runtime.
 * @param {string} formattedTime - The "HH:MM:SS" string.
 */
function insertOrUpdateTitle(formattedTime) {
  let titleElement = document.getElementById(RUNTIME_TITLE_ID);

  // If time is null (no videos), remove the element if it exists and stop.
  if (!formattedTime) {
    if (titleElement) {
      titleElement.remove();
    }
    return;
  }

  // If the element doesn't exist, create and insert it.
  if (!titleElement) {
    const breadcrumbs = document.querySelector('.ds-breadcrumbs');
    const grid = document.querySelector('.ds-my-list-videos-page__grid');

    // We need both elements to insert correctly
    if (!breadcrumbs || !grid) {
      return; // Anchors not found, will try again on next poll
    }

    titleElement = document.createElement('div');
    titleElement.id = RUNTIME_TITLE_ID;
    
    // Add styling to make it look good on the page
    titleElement.classList.add("h4");

    // Insert the new h4 *before* the grid (which is *after* the breadcrumbs)
    grid.parentNode.insertBefore(titleElement, grid);
  }
  
  // Now that we're sure titleElement exists, update its text.
  titleElement.textContent = `Total Runtime: ${formattedTime}`;
}

/**
 * A single function to calculate the time and update the DOM.
 */
function refreshRuntime() {
  const time = calculateTotalTime();
  insertOrUpdateTitle(time);
}

/**
 * Creates a MutationObserver to watch for videos being added or removed.
 * @param {HTMLElement} gridBody - The element containing the video cards.
 */
function startListObserver(gridBody) {
  // Disconnect any old observer first
  if (listObserver) {
    listObserver.disconnect();
  }

  // Create a new observer
  listObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      // If the list of children changes, recalculate
      if (mutation.type === 'childList') {
        refreshRuntime();
        break;
      }
    }
  });

  // Observe the grid body for changes to its direct children
  listObserver.observe(gridBody, { childList: true });
}

/**
 * Polls the page to find the grid, does initial calculation,
 * and sets up the MutationObserver.
 */
function initListRuntime() {
  let pollCount = 0;
  const maxPolls = 40; // Stop after 20 seconds

  const pollInterval = setInterval(() => {
    pollCount++;
    // Find all the elements we need
    const breadcrumbs = document.querySelector('.ds-breadcrumbs');
    const grid = document.querySelector('.ds-my-list-videos-page__grid');
    // This is the actual container for the video cards
    const gridBody = document.querySelector('.ds-my-list-videos-page__videos');

    // Check if all elements are ready
    if (breadcrumbs && grid && gridBody) {
      // 1. Stop polling, we found them
      clearInterval(pollInterval);
      
      // 2. Do the initial calculation and update the title
      refreshRuntime();
      
      // 3. Start the MutationObserver to watch for changes
      startListObserver(gridBody);
      
      return;
    }
    
    // Stop if we've tried too many times
    if (pollCount >= maxPolls) {
      clearInterval(pollInterval);
    }
  }, 500); // Check every 500ms
}

// --- Main Execution ---

// 1. Add listener for page navigations
window.addEventListener('ds-page-updated', (event) => {
  // Check for the new URL
  if (event.detail.href.includes("/spanish/library/videos")) {
    initListRuntime();
  } else {
    // User navigated away, disconnect the observer
    if (listObserver) {
      listObserver.disconnect();
      listObserver = null;
    }
    // Also remove the title if it exists
    const titleElement = document.getElementById(RUNTIME_TITLE_ID);
    if (titleElement) {
      titleElement.remove();
    }
  }
});

// 2. Run once on initial load
if (document.location.href.includes("/spanish/library/videos")) {
  initListRuntime();
}
