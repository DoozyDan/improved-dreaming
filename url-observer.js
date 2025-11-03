(function() {
  /**
   * Dispatches a custom event to notify other scripts that the page has navigated.
   */
  function dispatchPageUpdate() {
    const pageUpdateEvent = new CustomEvent('ds-page-updated', {
      detail: {
        href: document.location.href
      }
    });
    window.dispatchEvent(pageUpdateEvent);
  }

  // --- Main Execution ---

  // Strategy 1: Use the modern Navigation API (preferred)
  if (window.navigation) {
    window.navigation.addEventListener("navigatesuccess", dispatchPageUpdate);
  } 
  // Strategy 2: Fallback to MutationObserver (your 'widen' script's logic)
  else {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    
    if (body) {
      const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href;
          dispatchPageUpdate();
        }
      });
      observer.observe(body, { childList: true, subtree: true });
    } else {
      // Failsafe if body isn't ready
      window.addEventListener('load', () => {
         const observer = new MutationObserver(mutations => {
           if (oldHref !== document.location.href) {
             oldHref = document.location.href;
             dispatchPageUpdate();
           }
         });
         observer.observe(document.querySelector("body"), { childList: true, subtree: true });
      });
    }
    console.warn("DS Enhancer: Using MutationObserver fallback for navigation.");
  }
})();