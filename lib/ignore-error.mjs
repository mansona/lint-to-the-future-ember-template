import { writeFileSync } from 'fs';

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
    const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/);
    const existing = matched[1].split(' ')
      .map(item => item.trim())
      .filter(item => item.length);

    uniqueIds = [...new Set([...ruleIds, ...existing])];
    uniqueIds.sort((a, b) => a.localeCompare(b));

    writeFileSync(filePath, file.replace(/^.*\n/, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n`));
  } else {
    uniqueIds.sort((a, b) => a.localeCompare(b));
    writeFileSync(filePath, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n${file}`);
  }
}
