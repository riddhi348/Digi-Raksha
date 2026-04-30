/* theme-bridge.js
   Reads CSS variables from the active [data-theme] and patches
   every element that uses hardcoded Tailwind color classes or
   inline style hex values so they all respond to theme switches.
*/

(function () {
  function getCSSVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
  }

  function applyThemeBridge() {
    const primary   = getCSSVar('--primary');
    const secondary = getCSSVar('--secondary');
    const accent    = getCSSVar('--accent');
    const bgLight   = getCSSVar('--bg-light');
    const bgDark    = getCSSVar('--bg-dark');
    const cardDark  = getCSSVar('--card-dark');
    const btnGrad   = getCSSVar('--btn-grad');
    const mesh1     = getCSSVar('--mesh1');
    const mesh2     = getCSSVar('--mesh2');
    const mesh1d    = getCSSVar('--mesh1d');
    const mesh2d    = getCSSVar('--mesh2d');
    const isDark    = document.documentElement.classList.contains('dark');

    // ── inject a dynamic <style> tag that overrides Tailwind's
    //    hardcoded color utilities with the current theme vars ──
    let styleTag = document.getElementById('theme-bridge-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-bridge-style';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      /* Tailwind text utilities */
      .text-primary   { color: var(--primary)   !important; }
      .text-secondary { color: var(--secondary) !important; }
      .text-accent    { color: var(--accent)    !important; }

      /* Tailwind bg utilities */
      .bg-primary   { background-color: var(--primary)   !important; }
      .bg-secondary { background-color: var(--secondary) !important; }
      .bg-accent    { background-color: var(--accent)    !important; }

      /* Tailwind border utilities */
      .border-primary   { border-color: var(--primary)   !important; }
      .border-secondary { border-color: var(--secondary) !important; }
      .border-accent    { border-color: var(--accent)    !important; }

      /* Opacity variants */
      .bg-accent\\/5  { background-color: color-mix(in srgb, var(--accent) 5%,  transparent) !important; }
      .bg-accent\\/10 { background-color: color-mix(in srgb, var(--accent) 10%, transparent) !important; }
      .bg-accent\\/20 { background-color: color-mix(in srgb, var(--accent) 20%, transparent) !important; }
      .bg-primary\\/5  { background-color: color-mix(in srgb, var(--primary) 5%,  transparent) !important; }
      .bg-primary\\/10 { background-color: color-mix(in srgb, var(--primary) 10%, transparent) !important; }
      .bg-primary\\/20 { background-color: color-mix(in srgb, var(--primary) 20%, transparent) !important; }
      .border-accent\\/8  { border-color: color-mix(in srgb, var(--accent) 8%,  transparent) !important; }
      .border-accent\\/20 { border-color: color-mix(in srgb, var(--accent) 20%, transparent) !important; }
      .border-accent\\/40 { border-color: color-mix(in srgb, var(--accent) 40%, transparent) !important; }
      .border-primary\\/8  { border-color: color-mix(in srgb, var(--primary) 8%,  transparent) !important; }
      .border-primary\\/15 { border-color: color-mix(in srgb, var(--primary) 15%, transparent) !important; }
      .hover\\:text-secondary:hover { color: var(--secondary) !important; }
      .hover\\:text-accent:hover    { color: var(--accent)    !important; }
      .hover\\:bg-accent\\/5:hover  { background-color: color-mix(in srgb, var(--accent) 5%, transparent) !important; }
      .hover\\:border-accent\\/40:hover { border-color: color-mix(in srgb, var(--accent) 40%, transparent) !important; }
      .dark\\:text-accent  { color: var(--accent)    !important; }
      .dark\\:text-primary { color: var(--primary)   !important; }
      .dark\\:bg-accent\\/8 { background-color: color-mix(in srgb, var(--accent) 8%, transparent) !important; }
      .dark\\:border-accent\\/8 { border-color: color-mix(in srgb, var(--accent) 8%, transparent) !important; }
      .animate-pulse.bg-accent { background-color: var(--accent) !important; }
      .ring-secondary { --tw-ring-color: var(--secondary) !important; }

      /* Vault status card */
      .vault-status-card {
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--accent) 10%, transparent),
          color-mix(in srgb, var(--secondary) 5%, transparent)) !important;
        border-color: color-mix(in srgb, var(--accent) 15%, transparent) !important;
      }

      /* Feature cards dark bg */
      html.dark .feature-card { background: var(--card-dark) !important; }
      html.dark .bg-\\[\\#111A16\\] { background: var(--card-dark) !important; }
      html.dark .bg-\\[\\#0d1612\\] { background: color-mix(in srgb, var(--bg-dark) 90%, var(--primary) 10%) !important; }

      /* Nav glass */
      .nav-glass {
        background: color-mix(in srgb, var(--bg-light) 85%, transparent) !important;
        border-bottom-color: color-mix(in srgb, var(--primary) 8%, transparent) !important;
      }
      html.dark .nav-glass {
        background: color-mix(in srgb, var(--bg-dark) 85%, transparent) !important;
        border-bottom-color: color-mix(in srgb, var(--accent) 8%, transparent) !important;
      }

      /* Topbar */
      .topbar {
        border-bottom-color: color-mix(in srgb, var(--primary) 7%, transparent) !important;
      }
      html.dark .topbar {
        background: color-mix(in srgb, var(--bg-dark) 80%, transparent) !important;
        border-bottom-color: color-mix(in srgb, var(--accent) 7%, transparent) !important;
      }

      /* Logo gradient */
      .logo-grad { background: linear-gradient(135deg, var(--secondary), var(--primary)) !important; }

      /* Step numbers */
      .step-num {
        background: linear-gradient(135deg, var(--accent), var(--secondary)) !important;
        color: var(--primary) !important;
        box-shadow: 0 4px 12px var(--accent-glow) !important;
      }

      /* Vault visual */
      .vault-visual {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, color-mix(in srgb, var(--primary) 80%, black) 100%) !important;
        box-shadow: 0 32px 80px var(--btn-shadow), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent) !important;
      }
      .vault-ring {
        border-color: color-mix(in srgb, var(--accent) 30%, transparent) !important;
      }
      .vault-ring-inner {
        border-color: color-mix(in srgb, var(--accent) 50%, transparent) !important;
        background: color-mix(in srgb, var(--accent) 8%, transparent) !important;
      }
      @keyframes pulse-ring {
        0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 20%, transparent); }
        50%      { box-shadow: 0 0 0 20px transparent; }
      }

      /* Hero glow */
      .hero-glow {
        background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 70%) !important;
      }

      /* CTA section */
      .cta-section {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
      }

      /* Left panel (login/signin/signup) */
      .left-panel {
        background: linear-gradient(145deg, var(--primary) 0%, var(--secondary) 60%, color-mix(in srgb, var(--primary) 80%, black) 100%) !important;
      }

      /* Sidebar logo */
      .sidebar-logo-grad {
        background: linear-gradient(135deg, var(--secondary), var(--primary)) !important;
      }

      /* Profile avatar */
      .profile-avatar-grad {
        background: linear-gradient(135deg, var(--secondary), var(--primary)) !important;
      }

      /* Upload zone */
      .upload-zone {
        border-color: color-mix(in srgb, var(--secondary) 30%, transparent) !important;
        background: color-mix(in srgb, var(--accent) 3%, transparent) !important;
      }
      .upload-zone:hover {
        border-color: var(--accent) !important;
        background: color-mix(in srgb, var(--accent) 6%, transparent) !important;
      }

      /* Progress bar */
      .progress-bar-fill {
        background: linear-gradient(90deg, var(--accent), var(--secondary)) !important;
        box-shadow: 0 0 12px var(--accent-glow) !important;
      }

      /* Protocol card selected */
      .protocol-card.selected {
        border-color: var(--accent) !important;
        background: color-mix(in srgb, var(--accent) 6%, transparent) !important;
      }

      /* Method cards */
      .method-card:hover {
        border-color: color-mix(in srgb, var(--accent) 40%, transparent) !important;
      }

      /* Access cards (login page) */
      .access-card:hover {
        box-shadow: 0 8px 32px var(--btn-shadow), 0 0 0 1.5px color-mix(in srgb, var(--accent) 30%, transparent) !important;
        border-color: color-mix(in srgb, var(--accent) 30%, transparent) !important;
      }

      /* Icon box */
      .icon-box {
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--accent) 15%, transparent),
          color-mix(in srgb, var(--secondary) 8%, transparent)) !important;
        color: var(--secondary) !important;
      }
      html.dark .icon-box { color: var(--accent) !important; }

      /* Badge accent */
      .badge-accent {
        background: color-mix(in srgb, var(--accent) 12%, transparent) !important;
        color: var(--secondary) !important;
        border-color: color-mix(in srgb, var(--accent) 25%, transparent) !important;
      }
      html.dark .badge-accent { color: var(--accent) !important; }

      /* Scrollbar */
      ::-webkit-scrollbar-thumb { background: var(--accent) !important; }

      /* Dark mode bg overrides */
      html.dark body { background: var(--bg-dark) !important; }
      html.dark .sidebar { background: var(--card-dark) !important; }
      html.dark .form-card { background: var(--card-dark) !important; }
      html.dark .stat-card { background: var(--card-dark) !important; }
    `;
  }

  // Run on load and whenever theme/dark changes
  document.addEventListener('DOMContentLoaded', applyThemeBridge);

  // Watch for data-theme and class changes on <html>
  const observer = new MutationObserver(applyThemeBridge);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  });
})();
