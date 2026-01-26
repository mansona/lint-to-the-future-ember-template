import { writeFileSync } from 'fs';
import { getExistingIgnores } from './utils.js';
import { Transformer } from 'content-tag-utils';

function getRuleIds(errors) {
  return errors
    .filter(error => error.severity === 2)
    .map(error => error.rule);
}

function isErrorInTemplateBlock(error, templateContent, coordinates) {
  const errorLine = error.line - 1;
  const templateStart = coordinates.line;
  const templateEnd = coordinates.line + templateContent.split('\n').length;

  return errorLine >= templateStart && errorLine <= templateEnd;
}

function applyNewIgnoreRules(templateContent, newRuleIds) {
  const existing = getExistingIgnores(templateContent);
  const mergedRules = [...new Set([...existing, ...newRuleIds])].sort((a, b) => a.localeCompare(b));
  const lines = templateContent.split('\n');
  const contentLine = lines.find(line => line.trim().length > 0);
  if (!contentLine) {
    throw new Error('Cannot add ignore declaration to empty content');
  }
  const indentation = contentLine.match(/^\s*/)[0];
  const ignoreDeclaration = `${indentation}{{! template-lint-disable ${mergedRules.join(' ')} }}`;

  if (lines[0].includes('template-lint-disable')) {
    return templateContent.replace(/^.*\n/, `${ignoreDeclaration}\n`);
  } else {
    const newLines = [];
    let addedIgnore = false;

    for (const line of lines) {
      if (!addedIgnore && line.trim().length > 0) {
        newLines.push(ignoreDeclaration);
        addedIgnore = true;
      }
      newLines.push(line);
    }

    return newLines.join('\n');
  }
}

export default function ignoreError(errorInput, file, filePath) {
  let errors = errorInput.results ?? errorInput;

  // Ensure errors is an array
  if (!Array.isArray(errors)) {
    if (errors && Array.isArray(errors.messages)) {
      errors = errors.messages;
    } else {
      errors = [];
    }
  }

  const isTemplateFile = filePath.endsWith('.gjs') || filePath.endsWith('.gts');

  if (isTemplateFile) {
    try {
      const transformer = new Transformer(file);

      transformer.map((templateContent, coordinates) => {
        // Get errors specific to this template block by matching the error line and column to the template block coordinates
        const templateErrors = errors.filter(error => isErrorInTemplateBlock(error, templateContent, coordinates));

        if (!templateErrors.length) {
          return templateContent;
        }

        const ruleIds = getRuleIds(templateErrors);
        if (!ruleIds.length) {
          return templateContent;
        }

        return applyNewIgnoreRules(templateContent, ruleIds);
      });

      writeFileSync(filePath, transformer.toString());
    } catch (error) {
      throw new Error(`Unable to parse template file ${filePath}: ${error.message}`);
    }
    return;
  }

  // We did not detect the file to be a GJS or GTS file so we process it as a hbs file
  const ruleIds = getRuleIds(errors);
  if (!ruleIds.length) {
    return;
  }

  const newFile = applyNewIgnoreRules(file, ruleIds)

  writeFileSync(filePath, newFile);
}
