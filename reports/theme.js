// Write the deck's colour scheme and fonts into the saved .pptx.
//
// pptxgenjs saves a default Office theme. The decks colour their shapes and
// charts with theme colours (pres.SchemeColor.accent1 and so on), so after
// saving, this replaces the theme's colour scheme, its heading and body fonts
// and its name in ppt/theme/theme*.xml.
const fs = require("fs");
const JSZip = require("jszip");

const SLOTS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function setTheme(file, theme) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const parts = Object.keys(zip.files).filter((n) => /^ppt\/theme\/theme\d+\.xml$/.test(n));
  const name = attr(theme.name);
  for (const part of parts) {
    let xml = await zip.file(part).async("string");
    const colours = SLOTS.map((s) => {
      if (!/^[0-9A-Fa-f]{6}$/.test(theme.colors[s] || "")) throw new Error(`theme colour ${s} must be a 6-digit hex value`);
      return `<a:${s}><a:srgbClr val="${theme.colors[s].toUpperCase()}"/></a:${s}>`;
    }).join("");
    xml = xml
      .replace(/(<a:theme\b[^>]*?\sname=")[^"]*(")/, `$1${name}$2`)
      .replace(/<a:clrScheme\b[^>]*>[\s\S]*?<\/a:clrScheme>/, `<a:clrScheme name="${name}">${colours}</a:clrScheme>`)
      .replace(/<a:fontScheme\b[^>]*>/, `<a:fontScheme name="${name}">`)
      .replace(/(<a:majorFont>\s*<a:latin typeface=")[^"]*(")/, `$1${attr(theme.headFontFace)}$2`)
      .replace(/(<a:minorFont>\s*<a:latin typeface=")[^"]*(")/, `$1${attr(theme.bodyFontFace)}$2`);
    zip.file(part, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { setTheme };
