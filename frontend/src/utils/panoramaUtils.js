/**
 * Panorama helpers — align public site with backoffice / API shapes (multer paths, publicId, subdoc _id).
 */

export function getApiBaseUrl() {
  const raw = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
  if (raw.toLowerCase().endsWith('/api')) {
    return raw.slice(0, -4).replace(/\/$/, '') || 'http://localhost:5000';
  }
  return raw || 'http://localhost:5000';
}

/**
 * Full URL for a panorama equirectangular image (same rules as backoffice buildScene).
 * @param {object} scene — { url?, publicId? }
 * @param {string} [baseUrl]
 */
export function resolvePanoramaImageUrl(scene, baseUrl) {
  const base = (baseUrl || getApiBaseUrl()).replace(/\/$/, '');
  if (!scene) return '';

  if (scene.url && /^https?:\/\//i.test(String(scene.url).trim())) {
    return String(scene.url).trim();
  }

  if (scene.publicId) {
    const fn = String(scene.publicId).replace(/\\/g, '/').split('/').filter(Boolean).pop();
    if (fn) return `${base}/uploads/${fn}`;
  }

  const raw = scene.url;
  if (raw == null || String(raw).trim() === '') return '';

  let s = String(raw).replace(/\\/g, '/').trim();
  const lower = s.toLowerCase();
  const idx = lower.indexOf('uploads/');
  if (idx >= 0) {
    s = s.slice(idx);
  } else {
    const fileName = s.split('/').pop();
    if (fileName) s = `uploads/${fileName}`;
    else return '';
  }

  s = s.replace(/^\/+/, '');
  if (!s.toLowerCase().startsWith('uploads/')) {
    s = `uploads/${s}`;
  }

  return `${base}/${s}`;
}

/**
 * @param {unknown} panoramas
 * @returns {Array<{ id: string, name: string, url: string, linkHotspots?: array, initialViewParameters?: object }>}
 */
export function normalizePanoramas(panoramas) {
  if (!Array.isArray(panoramas)) return [];

  return panoramas
    .map((p) => {
      if (!p || typeof p !== 'object') return null;
      const id =
        p.id != null && String(p.id) !== ''
          ? String(p.id)
          : p.publicId != null && String(p.publicId) !== ''
            ? String(p.publicId)
            : p._id != null
              ? String(p._id)
              : '';

      const url = p.url != null ? String(p.url) : '';
      const publicId = p.publicId != null ? String(p.publicId) : '';

      if (!id || (!url && !publicId)) return null;

      const linkHotspots = Array.isArray(p.linkHotspots)
        ? p.linkHotspots.map((h) => {
            const entry = {
              yaw: Number(h.yaw) || 0,
              pitch: Number(h.pitch) || 0,
              target: h.target != null ? String(h.target) : '',
            };
            if (h.linkId) entry.linkId = String(h.linkId);
            if (h.targetViewParameters && typeof h.targetViewParameters === 'object') {
              entry.targetViewParameters = {
                yaw: Number(h.targetViewParameters.yaw) || 0,
                pitch: Number(h.targetViewParameters.pitch) || 0,
                fov: Number(h.targetViewParameters.fov) || 1.5707963267948966,
              };
            }
            return entry;
          })
        : [];

      return {
        id,
        name: p.name || 'Room',
        url,
        publicId: publicId || undefined,
        linkHotspots,
        initialViewParameters:
          p.initialViewParameters && typeof p.initialViewParameters === 'object'
            ? { ...p.initialViewParameters }
            : undefined,
      };
    })
    .filter(Boolean);
}
