import { writeFileSync } from 'fs';
import { Transformer } from 'content-tag-utils';

export default function ignoreError(errorInput, file, filePath) {
  let errors = errorInput.results ?? errorInput;

  const isTemplateFile = filePath.endsWith('.gjs') || filePath.endsWith('.gts');

  if (isTemplateFile) {
    try {
      const transformer = new Transformer(file);

      transformer.map((templateContent) => {
        // Get errors specific to this template block by matching the error source with the template content
        const templateErrors = errors.filter(error => {
          // Check if the error's source code appears in this template block
          const errorLine = error.source?.trim();
          if (!errorLine) return false;

          return templateContent.includes(errorLine);
        });

        // Only add ignore declarations if there are errors in this template
        if (!templateErrors.length) {
          return templateContent;
        }

        const ruleIds = templateErrors
          .filter(error => error.severity === 2)
          .map(error => error.rule);

        let uniqueIds = [...new Set(ruleIds)];

        if (!uniqueIds.length) {
          return templateContent;
        }

        const templateLines = templateContent.split('\n');
        const contentLine = templateLines.find(line => line.trim().length > 0);
        const indentation = contentLine.match(/^\s*/)[0];
        const ignoreDeclaration = `${indentation}{{! template-lint-disable ${uniqueIds.join(' ')} }}`;

        if (templateLines[0].includes('template-lint-disable')) {
          const matched = templateLines[0].match(/template-lint-disable(.*)(--)?\}\}/);
          const existing = matched[1].split(' ')
            .map(item => item.trim())
            .filter(item => item.length);

          uniqueIds = [...new Set([...ruleIds, ...existing])];
          uniqueIds.sort((a, b) => a.localeCompare(b));

          return templateContent.replace(/^.*\n/, `${ignoreDeclaration}\n`);
        } else {
          uniqueIds.sort((a, b) => a.localeCompare(b));
          // Add the ignore declaration at the top with proper indentation
          const newLines = [];
          let addedIgnore = false;

          for (const line of templateLines) {
            if (!addedIgnore && line.trim().length > 0) {
              newLines.push(ignoreDeclaration);
              addedIgnore = true;
            }
            newLines.push(line);
          }

          return newLines.join('\n');
        }
      });

      writeFileSync(filePath, transformer.toString());
    } catch {
      console.warn("Unable to parse template file", filePath);
      return;
    }
    return;
  }

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
