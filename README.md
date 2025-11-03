# Improved Dreaming

This is a browser extension for Firefox designed to enhance the `app.dreaming.com` website (e.g., Dreaming Spanish). It adds two key quality-of-life features: a total runtime calculator for your video list and a widescreen toggle for the video player.

## 🚀 Features

This extension bundles two main features into one:

1.  **Video List Runtime Calculator:**
    * **What it does:** Automatically calculates the total combined runtime of all videos on your "My list: videos" page.
    * **Where:** Injects a new title (e.g., `Total Runtime: 01:32:45`) directly onto the `/spanish/library/videos` page, right above the video grid.
    * **Smart Updates:** The total time instantly and automatically updates if you remove a video from the list, so you always see the correct total.

2.  **Widescreen Video Player Toggle:**
    * **What it does:** Adds a toggle button to the video player page that lets you switch between the default centered view and a full-widescreen view.
    * **Where:** The toggle button (`<->`) is added to the action bar, next to the "Share" and "Download" buttons on any video watch page.
    * **Remembers Your Choice:** Your preference (widescreen or standard) is saved in your browser's `localStorage`. It defaults to widescreen, but if you switch it, it will remember your choice for the next video you watch.

## 📦 Installation

There are two ways to install this extension: locally for development purposes (temporary) or by installing it from the Firefox store.

### Local / Temporary Installation (For Development)

This method is for testing, development. The add-on will be loaded until you restart Firefox.

1.  **Create a Folder:** On your computer, create a new folder. Name it something like `improved-dreaming`.

2.  **Save the Files:** Save all four of the following files inside that new folder:
    * `manifest.json`
    * `url-observer.js`
    * `list-runtime.js`
    * `widescreen-mode.js`

3.  **Load in Firefox:**
    * Open a new tab in Firefox.
    * Type **`about:debugging`** into the address bar and press **Enter**.
    * In the left-hand menu, click **"This Firefox"**.
    * Click the **"Load Temporary Add-on..."** button.
    * Navigate into the `improved-dreaming-extension` folder you created.
    * Select **any** of the four files (e.g., `manifest.json`).

The extension is now active! You will see it listed on the `about:debugging` page. You will need to repeat this process every time you restart Firefox.

## ⚙️ How to Use

Once installed, the extension works automatically.

* **To see the Runtime:**
    1.  Navigate to your "My list: videos" page.
    2.  The URL should end in `/spanish/library/videos`.
    3.  Look above the grid of videos. You will see a new line of text: **Total Runtime: HH:MM:SS**.

* **To use the Widescreen Toggle:**
    1.  Click on any video to open the watch page.
    2.  In the row of buttons under the video, you will see a new button with `<->` or `-><-` on it.
    3.  Click this button to toggle between widescreen and standard view.

## 🔧 How It Works (Technical Details)

This extension is built from three JavaScript files, all loaded by the `manifest.json`.

* **`manifest.json`:** The "brains" of the operation. It tells Firefox the extension's name, description, and what files to load. It uses a `matches` rule to only run the scripts on `app.dreaming.com`.

* **`url-observer.js`:** The central navigation listener. Since the website is a Single Page Application (SPA), it doesn't do full page reloads. This script detects when you navigate from one page to another and dispatches a custom event called `ds-page-updated`.

* **`list-runtime.js`:**
    * Listens for the `ds-page-updated` event.
    * If the new URL is `/spanish/library/videos`, it runs an initializer (`initListRuntime`).
    * This function polls the page until the video grid is loaded.
    * It then calculates the total time and injects a `<div>` element (styled as an `h4`) to display it.
    * It also starts a `MutationObserver` to watch the video list. If a video is removed (a "childList" change), it automatically triggers `refreshRuntime` to recalculate the time.

* **`widescreen-mode.js`:**
    * Listens for the `ds-page-updated` event.
    * If the new URL includes `/watch?`, it runs an initializer (`initWidescreen`).
    * This function polls the page until the video player and action bar are loaded.
    * It reads `localStorage` to get your saved preference (defaulting to `true` for wide).
    * It injects the new toggle button (`<button>`) into the action bar.
    * It applies the correct style (`max-width: 'none'` or `max-width: ''`) based on your preference.
    * The button's click event toggles the preference, saves it to `localStorage`, and re-applies the style.