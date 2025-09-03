const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'docx-preview', 'dist', 'docx-preview.mjs');

try {
  if (fs.existsSync(target)) {
    let content = fs.readFileSync(target, 'utf8');
    const cleaned = content.replace(/\/\/# sourceMappingURL=.*\n?/g, '').replace(/\/\*# sourceMappingURL=.*\*\//g, '');
    if (cleaned !== content) {
      fs.writeFileSync(target, cleaned, 'utf8');
      console.log('[fix-docx-sourcemap] cleaned sourceMappingURL comments in docx-preview');
    } else {
      console.log('[fix-docx-sourcemap] no changes needed');
    }
  } else {
    console.log('[fix-docx-sourcemap] target file not found, skipping');
  }
} catch (err) {
  console.error('[fix-docx-sourcemap] error', err.message);
  process.exit(0);
}
