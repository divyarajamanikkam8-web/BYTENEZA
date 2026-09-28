/*
  Analytics architecture (no IDs are hardcoded — fill window.BZ_CONFIG at deploy
  time from environment variables, e.g. injected by your build/CI process).

  Example (set BEFORE this script loads, e.g. in a small inline snippet
  populated from your host's environment variables):
    <script>
      window.BZ_CONFIG = {
        gaMeasurementId: "%%GA_MEASUREMENT_ID%%",   // e.g. G-XXXXXXX
        metaPixelId: "%%META_PIXEL_ID%%"
      };
    </script>
  Never commit real measurement IDs or tokens into source files.
*/
window.BZ_CONFIG = window.BZ_CONFIG || { gaMeasurementId: '', metaPixelId: '' };
window.dataLayer = window.dataLayer || [];

/**
 * bzTrack(eventName, params)
 * Central event hook. Pushes to dataLayer (GA4-compatible) if analytics is
 * configured; otherwise no-ops silently so the site works with zero
 * third-party scripts until IDs are supplied.
 *
 * Tracked event names used across the site:
 *  - contact_form_submit   { service }
 *  - quote_click           { package }
 *  - start_project_click   { location }
 *  - discuss_idea_click    { location }
 *  - view_work_click       { location }
 *  - service_engagement    { service }
 *  - project_engagement    { project }
 *  - whatsapp_click        { }   (wire up once a real WhatsApp number exists)
 *  - email_click           { }
 */
function bzTrack(eventName, params) {
  params = params || {};
  if (window.BZ_CONFIG && (window.BZ_CONFIG.gaMeasurementId || window.BZ_CONFIG.metaPixelId)) {
    window.dataLayer.push(Object.assign({ event: eventName }, params));
  }
  /* Uncomment for local debugging only — remove before production build:
  console.debug('[bzTrack]', eventName, params); */
}
window.bzTrack = bzTrack;

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      var evt = el.getAttribute('data-track');
      var extra = {};
      if (el.hasAttribute('data-track-package')) extra.package = el.getAttribute('data-track-package');
      if (el.hasAttribute('data-track-service')) extra.service = el.getAttribute('data-track-service');
      if (el.hasAttribute('data-track-project')) extra.project = el.getAttribute('data-track-project');
      if (el.hasAttribute('data-track-location')) extra.location = el.getAttribute('data-track-location');
      bzTrack(evt, extra);
    });
  });
});
