/* =====================================================================
   Favicon Generator Pro — app.js
   Upload one image → square-crop → resize to every target favicon size,
   entirely client-side via <canvas>. Generates PNGs, a manifest.json
   snippet, and a copy-paste <head> HTML block.
   Classic script (no modules). Depends on window.WUS (core.js).
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;

  /* ----------------------------- Config ------------------------------ */
  var SIZE_DEFS = [
    { size: 16,  filename: 'favicon-16x16.png',      label: '16×16' },
    { size: 32,  filename: 'favicon-32x32.png',       label: '32×32' },
    { size: 48,  filename: 'favicon-48x48.png',       label: '48×48' },
    { size: 180, filename: 'apple-touch-icon.png',     label: '180×180 · Apple Touch' },
    { size: 192, filename: 'favicon-192x192.png',      label: '192×192' },
    { size: 512, filename: 'favicon-512x512.png',      label: '512×512' }
  ];
  var THEME_COLOR = '#08090d';
  var BACKGROUND_COLOR = '#ffffff';
  var MIN_RECOMMENDED = 512;
  var MASTER_MIN = 512;
  var MASTER_MAX = 2048;

  /* ----------------------------- DOM refs ---------------------------- */
  var dropZone        = document.getElementById('dropZone');
  var fileInput        = document.getElementById('fileInput');
  var sourcePreview     = document.getElementById('sourcePreview');
  var sourceImg         = document.getElementById('sourceImg');
  var sourceDims        = document.getElementById('sourceDims');
  var sourceFileInfo     = document.getElementById('sourceFileInfo');

  var btnGenerate       = document.getElementById('btnGenerate');
  var btnChangeImage     = document.getElementById('btnChangeImage');
  var btnClear           = document.getElementById('btnClear');

  var sizesSection       = document.getElementById('sizesSection');
  var sizesGrid           = document.getElementById('sizesGrid');

  var exportSection       = document.getElementById('exportSection');
  var appNameInput         = document.getElementById('appNameInput');
  var manifestOutput        = document.getElementById('manifestOutput');
  var htmlSnippetOutput      = document.getElementById('htmlSnippetOutput');
  var btnCopyManifest         = document.getElementById('btnCopyManifest');
  var btnCopyHtml              = document.getElementById('btnCopyHtml');

  var emptyHint = document.getElementById('emptyHint');

  /* --------------------------- Runtime state -------------------------- */
  var masterCanvas = null;              // square-cropped source, high-res
  var sizeCanvases = [];                // one <canvas> per SIZE_DEFS entry (in DOM)
  var sizeInfoEls  = [];                // per-size meta <div>
  var sizeDownloadBtns = [];            // per-size download <button>
  var sizeBlobs = new Array(SIZE_DEFS.length); // generated PNG Blobs

  /* ------------------------------ Helpers ------------------------------ */
  function humanBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function defaultInfoText(def) {
    return def.size + '×' + def.size + ' · —';
  }

  /* =================================================================
     SIZE GRID — built once; canvases are redrawn in place on generate
     ================================================================= */
  function buildSizeGrid() {
    sizesGrid.innerHTML = '';
    sizeCanvases = [];
    sizeInfoEls = [];
    sizeDownloadBtns = [];

    SIZE_DEFS.forEach(function (def, i) {
      var card = document.createElement('div');
      card.className = 'size-card';

      var preview = document.createElement('div');
      preview.className = 'size-preview checker';

      var canvas = document.createElement('canvas');
      canvas.className = 'size-canvas';
      canvas.width = def.size;
      canvas.height = def.size;
      canvas.setAttribute('aria-label', def.label + ' favicon preview');
      preview.appendChild(canvas);

      var title = document.createElement('div');
      title.className = 'size-title';
      title.textContent = def.label;

      var info = document.createElement('div');
      info.className = 'size-info mono muted';
      info.textContent = defaultInfoText(def);

      var dlBtn = document.createElement('button');
      dlBtn.className = 'btn btn--sm btn--block';
      dlBtn.type = 'button';
      dlBtn.disabled = true;
      dlBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download';

      // Listener attached at creation time, closed over this size's index.
      (function (idx) {
        dlBtn.addEventListener('click', function () {
          var blob = sizeBlobs[idx];
          if (!blob) { WUS.toast('Generate the icons first', 'error'); return; }
          WUS.download(SIZE_DEFS[idx].filename, blob, 'image/png');
          WUS.toast('Downloaded ' + SIZE_DEFS[idx].filename);
        });
      })(i);

      card.appendChild(preview);
      card.appendChild(title);
      card.appendChild(info);
      card.appendChild(dlBtn);
      sizesGrid.appendChild(card);

      sizeCanvases.push(canvas);
      sizeInfoEls.push(info);
      sizeDownloadBtns.push(dlBtn);
    });
  }

  /* =================================================================
     IMAGE PIPELINE — cover-fit crop to square, then downscale per size
     ================================================================= */

  // Draws `img` cropped (cover-fit, centered) to a square master canvas.
  function buildMasterCanvas(img) {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    var side = Math.min(w, h);
    var sx = (w - side) / 2;
    var sy = (h - side) / 2;

    var masterSize = Math.max(MASTER_MIN, Math.min(MASTER_MAX, Math.max(w, h)));

    var canvas = document.createElement('canvas');
    canvas.width = masterSize;
    canvas.height = masterSize;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, masterSize, masterSize);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, masterSize, masterSize);
    return canvas;
  }

  function renderOneSize(def, i) {
    var canvas = sizeCanvases[i];
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, def.size, def.size);
    ctx.drawImage(masterCanvas, 0, 0, masterCanvas.width, masterCanvas.height, 0, 0, def.size, def.size);

    canvas.toBlob(function (blob) {
      if (!blob) { WUS.toast('Could not generate ' + def.label, 'error'); return; }
      sizeBlobs[i] = blob;
      sizeInfoEls[i].textContent = def.size + '×' + def.size + ' · ' + humanBytes(blob.size);
      sizeDownloadBtns[i].disabled = false;
    }, 'image/png');
  }

  function generateAll() {
    if (!masterCanvas) { WUS.toast('Upload an image first', 'error'); return; }
    SIZE_DEFS.forEach(function (def, i) { renderOneSize(def, i); });
    WUS.toast('Generated all ' + SIZE_DEFS.length + ' favicon sizes');
  }

  /* =================================================================
     EXPORT SNIPPETS — manifest.json + <head> HTML block
     ================================================================= */
  function buildManifestText() {
    var name = appNameInput.value.trim() || 'My App';
    var shortName = name.length > 12 ? name.slice(0, 12) : name;
    var manifest = {
      name: name,
      short_name: shortName,
      icons: SIZE_DEFS.map(function (def) {
        return { src: def.filename, sizes: def.size + 'x' + def.size, type: 'image/png' };
      }),
      theme_color: THEME_COLOR,
      background_color: BACKGROUND_COLOR,
      display: 'standalone'
    };
    return JSON.stringify(manifest, null, 2);
  }

  function buildHtmlSnippet() {
    var lines = [];
    SIZE_DEFS.forEach(function (def) {
      if (def.size === 180) {
        lines.push('<link rel="apple-touch-icon" sizes="180x180" href="' + def.filename + '">');
      } else {
        lines.push('<link rel="icon" type="image/png" sizes="' + def.size + 'x' + def.size + '" href="' + def.filename + '">');
      }
    });
    lines.push('<link rel="manifest" href="manifest.json">');
    lines.push('<meta name="theme-color" content="' + THEME_COLOR + '">');
    return lines.join('\n');
  }

  function updateExportSnippets() {
    manifestOutput.textContent = buildManifestText();
    htmlSnippetOutput.textContent = buildHtmlSnippet();
  }

  function copyManifest() {
    WUS.copy(manifestOutput.textContent, 'manifest.json copied to clipboard');
  }

  function copyHtmlSnippet() {
    WUS.copy(htmlSnippetOutput.textContent, 'HTML snippet copied to clipboard');
  }

  /* =================================================================
     FILE HANDLING
     ================================================================= */
  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.indexOf('image/') === 0) return true;
    return /\.(png|jpe?g|webp|svg|gif|bmp)$/i.test(file.name || '');
  }

  function handleFile(file) {
    if (!isImageFile(file)) {
      WUS.toast('Please choose an image file (PNG, JPG, WEBP, SVG, GIF, BMP)', 'error');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var dataUrl = e.target.result;
      var img = new Image();
      img.onload = function () { onImageReady(img, file, dataUrl); };
      img.onerror = function () { WUS.toast('Could not load that image — is it a valid image file?', 'error'); };
      img.src = dataUrl;
    };
    reader.onerror = function () { WUS.toast('Could not read that file', 'error'); };
    reader.readAsDataURL(file);
  }

  function onImageReady(img, file, dataUrl) {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;

    // Invalidate any sizes generated for a *previous* image before kicking off
    // generation for this one. Without this, picking a new image via "Change
    // image" leaves the old PNG Blobs in place — with their Download buttons
    // still enabled — until each size's async canvas.toBlob() callback
    // resolves, so a click during that window silently downloads the
    // previous image's icon instead of the new one.
    sizeBlobs = new Array(SIZE_DEFS.length);
    sizeInfoEls.forEach(function (el, i) { el.textContent = defaultInfoText(SIZE_DEFS[i]); });
    sizeDownloadBtns.forEach(function (btn) { btn.disabled = true; });

    sourceImg.src = dataUrl;
    sourceDims.textContent = w + ' × ' + h;
    sourceFileInfo.textContent = (file.name || 'image') + ' · ' + humanBytes(file.size || 0);

    dropZone.hidden = true;
    sourcePreview.hidden = false;
    sizesSection.hidden = false;
    exportSection.hidden = false;
    emptyHint.classList.add('is-hidden');

    masterCanvas = buildMasterCanvas(img);

    if (Math.abs(w - h) > Math.max(2, Math.round(Math.max(w, h) * 0.01))) {
      WUS.toast('Image isn’t square — it will be center-cropped to a square before generating icons.');
    }
    if (Math.min(w, h) < MIN_RECOMMENDED) {
      WUS.toast('Source is smaller than ' + MIN_RECOMMENDED + '×' + MIN_RECOMMENDED + ' — larger sizes will be upscaled and may look soft.');
    }

    updateExportSnippets();
    generateAll();
  }

  function triggerUpload() { fileInput.click(); }

  /* -------------------------------- Reset ------------------------------ */
  function resetAll() {
    masterCanvas = null;
    sizeBlobs = new Array(SIZE_DEFS.length);

    sizeCanvases.forEach(function (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    sizeInfoEls.forEach(function (el, i) { el.textContent = defaultInfoText(SIZE_DEFS[i]); });
    sizeDownloadBtns.forEach(function (btn) { btn.disabled = true; });

    sourceImg.src = '';
    sourceDims.textContent = '0 × 0';
    sourceFileInfo.textContent = '—';

    sourcePreview.hidden = true;
    sizesSection.hidden = true;
    exportSection.hidden = true;
    emptyHint.classList.remove('is-hidden');
    dropZone.hidden = false;

    fileInput.value = '';
    WUS.toast('Cleared');
  }

  /* =================================================================
     SHORTCUTS HELP MODAL
     ================================================================= */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose    = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'O'], desc: 'Upload / choose image' },
    { keys: ['mod', 'G'], desc: 'Generate all sizes' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) {
    if (e.target === helpBackdrop) closeHelp();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp();
  });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var hi = 0; hi < helpBtns.length; hi++) helpBtns[hi].addEventListener('click', openHelp);

  /* =================================================================
     WIRING
     ================================================================= */
  buildSizeGrid();

  dropZone.addEventListener('click', triggerUpload);
  dropZone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerUpload(); }
  });
  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('is-dragover');
  });
  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('is-dragover');
  });
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('is-dragover');
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    if (file) handleFile(file);
    fileInput.value = ''; // allow re-uploading the same file
  });

  btnGenerate.addEventListener('click', generateAll);
  btnChangeImage.addEventListener('click', triggerUpload);
  btnClear.addEventListener('click', resetAll);

  btnCopyManifest.addEventListener('click', copyManifest);
  btnCopyHtml.addEventListener('click', copyHtmlSnippet);
  appNameInput.addEventListener('input', WUS.debounce(updateExportSnippets, 150));

  /* Global keyboard shortcuts via WUS. */
  WUS.registerShortcut('mod+o', function () { triggerUpload(); }, 'Upload / choose image');
  WUS.registerShortcut('mod+g', function () { generateAll(); }, 'Generate all sizes');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* =================================================================
     INIT
     ================================================================= */
  buildShortcutTable();
  updateExportSnippets();
})();
