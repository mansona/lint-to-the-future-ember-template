import { writeFileSync } from 'fs';
import { getExistingIgnores } from './utils.js';

export default function ignoreError(errorInput, file, filePath) {
  let errors = errorInput.results ?? errorInput;

  const ruleIds = errors
    .filter(error => error.severity === 2)
    .map(error => error.rule);

  let uniqueIds = [...new Set(ruleIds)];

  if (!uniqueIds.length) {
    // no errors to ignore
    return;
  }

  const firstLine = file.split('\n')[0];

  if (firstLine.includes('template-lint-disable')) {
    const existing = getExistingIgnores(firstLine);

    uniqueIds = [...new Set([...ruleIds, ...existing])];
    uniqueIds.sort((a, b) => a.localeCompare(b));

    writeFileSync(filePath, file.replace(/^.*\n/, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n`));
  } else {
    uniqueIds.sort((a, b) => a.localeCompare(b));
    writeFileSync(filePath, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n${file}`);
  }
}
