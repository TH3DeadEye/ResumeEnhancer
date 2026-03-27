/**
 * generateEnhancementPDF
 *
 * Client-only utility — must be called from browser context.
 *
 * Builds a styled HTML document from an EnhancementResult, renders it to a
 * hidden off-screen div, then uses html2pdf.js to convert to a downloadable
 * PDF. CSS variables are resolved to rgb() values via getComputedStyle so
 * html2canvas (used internally by html2pdf) can render them correctly.
 */

import type { DownloadResult } from './api';

// ── CSS variable resolution ──────────────────────────────────────────────────
//
// html2pdf renders via html2canvas → <canvas>, which runs in an isolated
// rasterisation context that does NOT inherit CSS custom properties. We must
// resolve every var() to a concrete rgb() value before injecting HTML.

function resolveCSSVar(varName: string, property: 'color' | 'backgroundColor' = 'color'): string {
  if (typeof document === 'undefined') return '';
  const el = document.createElement('div');
  el.style.display = 'none';
  if (property === 'color') {
    el.style.color = `var(${varName})`;
  } else {
    el.style.backgroundColor = `var(${varName})`;
  }
  document.body.appendChild(el);
  const resolved = getComputedStyle(el)[property];
  document.body.removeChild(el);
  return resolved || '';
}

/** Convert an rgb() value to rgba() by appending an alpha channel. */
function withAlpha(rgb: string, alpha: number): string {
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  if (rgb.startsWith('rgba(')) return rgb.replace(/[\d.]+\)$/, `${alpha})`);
  if (rgb.startsWith('rgb('))  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  return rgb;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number | null | undefined, palette: Record<string, string>): string {
  if (score == null) return palette.textMuted;
  if (score >= 80)   return palette.success;
  if (score >= 60)   return palette.warning;
  return palette.danger;
}

function scoreBadgeHTML(score: number | undefined, c: Record<string, string>): string {
  if (score == null) return '';
  const color = scoreColor(score, c);
  return `<span style="
    display: inline-block;
    background: ${withAlpha(color, 0.12)};
    color: ${color};
    border: 1px solid ${withAlpha(color, 0.45)};
    border-radius: 999px;
    padding: 2px 9px;
    font-size: 11px;
    font-weight: 600;
    margin-left: 8px;
    vertical-align: middle;
    line-height: 1.5;
  ">${score}</span>`;
}

function sectionHeadingHTML(label: string, c: Record<string, string>): string {
  return `<div style="
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${c.textMuted};
    margin-top: 28px;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid ${c.border};
  ">${label}</div>`;
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function generateEnhancementPDF(
  data: DownloadResult,
  filename: string,
): Promise<void> {
  // Dynamic import keeps html2pdf.js out of the server bundle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdfModule = (await import('html2pdf.js')) as any;
  const html2pdf = html2pdfModule.default ?? html2pdfModule;

  // Resolve every design-system color to rgb() for html2canvas compatibility
  const c: Record<string, string> = {
    text:       resolveCSSVar('--text-primary'),
    textSec:    resolveCSSVar('--text-secondary'),
    textMuted:  resolveCSSVar('--text-muted'),
    bg:         resolveCSSVar('--bg-surface',  'backgroundColor'),
    bgSunken:   resolveCSSVar('--bg-sunken',   'backgroundColor'),
    bgSubtle:   resolveCSSVar('--bg-subtle',   'backgroundColor'),
    success:    resolveCSSVar('--success'),
    warning:    resolveCSSVar('--warning'),
    danger:     resolveCSSVar('--danger'),
    accent:     resolveCSSVar('--accent'),
    border:     resolveCSSVar('--border'),
  };

  const e = data.enhancement;

  const dateStr = data.enhanced_at
    ? new Date(data.enhanced_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });

  // ── Build the PDF content as an HTML string ──────────────────────────────

  let html = `
    <!-- ── Header ── -->
    <div style="
      border-bottom: 2px solid ${c.border};
      padding-bottom: 20px;
      margin-bottom: 4px;
    ">
      <div style="
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${c.textMuted};
        margin-bottom: 6px;
      ">Resume Enhancement Report</div>
      <div style="
        font-size: 22px;
        font-weight: 700;
        color: ${c.text};
        margin-bottom: 4px;
        letter-spacing: -0.02em;
      ">${filename.replace(/\.pdf$/i, '')}</div>
      <div style="font-size: 12px; color: ${c.textMuted};">${dateStr}</div>
    </div>

    <!-- ── Scores ── -->
    ${sectionHeadingHTML('Scores', c)}
    <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 4px;">
      <tr>
        ${(
          [
            { label: 'Overall Score', value: e.overall_score },
            { label: 'ATS Score',     value: e.ats_score     },
            { label: 'Job Match',     value: e.job_match_score },
          ] as const
        ).map(({ label, value }) => {
          const col = scoreColor(value, c);
          return `
            <td style="
              text-align: center;
              background: ${withAlpha(col, 0.1)};
              border: 1px solid ${withAlpha(col, 0.35)};
              border-radius: 10px;
              padding: 16px 8px;
              width: 33%;
            ">
              <div style="
                font-size: 28px;
                font-weight: 700;
                color: ${col};
                line-height: 1;
              ">${value ?? '—'}</div>
              <div style="
                font-size: 11px;
                color: ${c.textMuted};
                margin-top: 4px;
              ">${label}</div>
            </td>`;
        }).join('')}
      </tr>
    </table>
  `;

  // ── Suggested summary ──────────────────────────────────────────────────────

  if (e.summary_suggestion) {
    html += `
      ${sectionHeadingHTML('Suggested Summary', c)}
      <div style="
        background: ${c.bgSunken};
        border-left: 3px solid ${c.accent};
        border-radius: 0 8px 8px 0;
        padding: 14px 16px;
        font-style: italic;
        color: ${c.textSec};
        line-height: 1.65;
        font-size: 13px;
      ">${e.summary_suggestion}</div>
    `;
  }

  // ── Top wins ──────────────────────────────────────────────────────────────

  if (e.top_wins.length > 0) {
    html += `
      ${sectionHeadingHTML('Top Wins', c)}
      ${e.top_wins.map((win) => `
        <div style="
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 7px;
        ">
          <span style="
            color: ${c.success};
            font-weight: 700;
            flex-shrink: 0;
            margin-top: 1px;
          ">✓</span>
          <span style="
            color: ${c.text};
            font-size: 13px;
          ">${win}</span>
        </div>
      `).join('')}
    `;
  }

  // ── Missing keywords ──────────────────────────────────────────────────────

  if (e.missing_keywords.length > 0) {
    html += `
      ${sectionHeadingHTML('Missing Keywords', c)}
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${e.missing_keywords.map((kw) => `
          <span style="
            font-size: 11px;
            font-weight: 500;
            padding: 3px 10px;
            border-radius: 999px;
            background: ${withAlpha(c.warning, 0.12)};
            color: ${c.warning};
            border: 1px solid ${withAlpha(c.warning, 0.4)};
          ">${kw}</span>
        `).join('')}
      </div>
    `;
  }

  // ── Section feedback ──────────────────────────────────────────────────────

  if (e.section_feedback.length > 0) {
    html += sectionHeadingHTML('Section Feedback', c);

    e.section_feedback.forEach((section) => {
      html += `
        <div style="
          background: ${c.bgSubtle};
          border: 1px solid ${c.border};
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        ">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: ${c.text};
            margin-bottom: 8px;
          ">${section.section}${scoreBadgeHTML(section.score, c)}</div>

          ${section.feedback ? `
            <div style="
              font-size: 12px;
              color: ${c.textMuted};
              font-style: italic;
              margin-bottom: 10px;
              line-height: 1.5;
            ">${section.feedback}</div>
          ` : ''}

          ${section.suggestions.map((sug, i) => `
            <div style="
              margin-top: ${i > 0 ? '12px' : '0'};
              ${i > 0 ? `border-top: 1px solid ${c.border}; padding-top: 12px;` : ''}
            ">
              <div style="
                background: ${c.bgSunken};
                border-left: 2px solid ${withAlpha(c.danger, 0.55)};
                border-radius: 0 4px 4px 0;
                padding: 8px 10px;
                margin-bottom: 4px;
              ">
                <div style="
                  font-size: 9px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: ${c.textMuted};
                  font-weight: 600;
                  margin-bottom: 4px;
                ">Original</div>
                <div style="
                  font-size: 12px;
                  color: ${c.textSec};
                  line-height: 1.5;
                ">${sug.original}</div>
              </div>

              <div style="
                background: ${withAlpha(c.accent, 0.07)};
                border-left: 2px solid ${c.accent};
                border-radius: 0 4px 4px 0;
                padding: 8px 10px;
                margin-bottom: 4px;
              ">
                <div style="
                  font-size: 9px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: ${c.accent};
                  font-weight: 600;
                  margin-bottom: 4px;
                ">Improved</div>
                <div style="
                  font-size: 12px;
                  color: ${c.text};
                  font-weight: 500;
                  line-height: 1.5;
                ">${sug.improved}</div>
              </div>

              ${sug.reason ? `
                <div style="
                  font-size: 11px;
                  color: ${c.textMuted};
                  font-style: italic;
                  padding-left: 4px;
                  line-height: 1.5;
                ">
                  <span style="font-style: normal; font-weight: 500; color: ${c.textSec};">Why:</span>
                  ${sug.reason}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    });
  }

  // ── Render and download ────────────────────────────────────────────────────

  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 780px;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: ${c.text};
    background: ${c.bg || '#ffffff'};
    padding: 40px 48px;
    box-sizing: border-box;
  `;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await html2pdf()
      .from(container)
      .set({
        margin:      [8, 8, 8, 8],
        filename:    `${filename.replace(/\.pdf$/i, '')}_enhanced.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
