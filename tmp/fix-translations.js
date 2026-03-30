const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Betza\\Documents\\dev\\grdconverter\\src\\i18n\\translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add to interface
content = content.replace(
  /navLink:\s*string;(\s*\})/,
  "navLink: string;\n    dragDelete?: string;$1"
);

// 2. Add to translations
const translations = {
  ko: '"아래로 드래그하여 삭제"',
  en: '"Drag down to delete"',
  pt: '"Arraste para baixo para excluir"',
  zh: '"向下拖动以删除"',
  ja: '"下にドラッグして削除"',
  ar: '"اسحب لأسفل للحذف"',
  hi: '"हटाने के लिए नीचे खींचें"',
};

for (const [lang, text] of Object.entries(translations)) {
  const regex = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?create:\\s*\\{[\\s\\S]*?navLink:[^,\\n]*?)(,?)\\s*\\}`, 'g');
  content = content.replace(regex, `$1,\n      dragDelete:    ${text},\n    }`);
}

fs.writeFileSync(filePath, content);
console.log('Translations updated successfully.');
