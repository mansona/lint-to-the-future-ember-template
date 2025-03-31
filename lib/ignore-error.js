import { writeFileSync } from 'fs';
import { Transformer } from 'content-tag-utils';

function getRuleIds(errors) {
  const ruleIds = errors
    .filter(error => error.severity === 2)
    .map(error => error.rule);

  return [...new Set(ruleIds)].sort((a, b) => a.localeCompare(b));
}

function getExistingRules(line) {
  const matched = line.match(/template-lint-disable(.*)(--)?\}\}/);
  return matched[1].split(' ')
    .map(item => item.trim())
    .filter(item => item.length);
}

function mergeRules(existing, newRules) {
  return [...new Set([...existing, ...newRules])].sort((a, b) => a.localeCompare(b));
}

function createIgnoreDeclaration(rules, indentation = '') {
  return `${indentation}{{! template-lint-disable ${rules.join(' ')} }}`;
}

function addIgnoreToContent(content, rules) {
  const lines = content.split('\n');
  const contentLine = lines.find(line => line.trim().length > 0);
  const indentation = contentLine.match(/^\s*/)[0];
  const ignoreDeclaration = createIgnoreDeclaration(rules, indentation);

  if (lines[0].includes('template-lint-disable')) {
    return content.replace(/^.*\n/, `${ignoreDeclaration}\n`);
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

function isErrorInTemplateBlock(error, templateContent, coordinates, fileContent) {
  if (!error.line || !error.column) return false;

  // Get the error's character offset by counting characters up to the error position
  const lines = fileContent.split('\n');
  const errorOffset = lines.slice(0, error.line - 1).reduce((sum, line) => sum + line.length + 1, 0) + error.column;

  // Check if the error offset is within the template block's range
  return errorOffset >= coordinates.start && errorOffset <= coordinates.end;
}

export default function ignoreError(errorInput, file, filePath) {
  const errors = errorInput.results ?? errorInput;
  const isTemplateFile = filePath.endsWith('.gjs') || filePath.endsWith('.gts');

  if (isTemplateFile) {
    try {
      const transformer = new Transformer(file);

      transformer.map((templateContent, coordinates) => {
        // Get errors specific to this template block by matching the error line and column to the template block coordinates
        const templateErrors = errors.filter(error => isErrorInTemplateBlock(error, templateContent, coordinates, file));

        if (!templateErrors.length) {
          return templateContent;
        }

        const ruleIds = getRuleIds(templateErrors);
        if (!ruleIds.length) {
          return templateContent;
        }

        const lines = templateContent.split('\n');
        if (lines[0].includes('template-lint-disable')) {
          const existing = getExistingRules(lines[0]);
          const mergedRules = mergeRules(existing, ruleIds);
          return addIgnoreToContent(templateContent, mergedRules);
        } else {
          return addIgnoreToContent(templateContent, ruleIds);
        }
      });

      writeFileSync(filePath, transformer.toString());
    } catch {
      console.warn("Unable to parse template file", filePath);
      return;
    }
    return;
  }

  const ruleIds = getRuleIds(errors);
  if (!ruleIds.length) {
    return;
  }

  const firstLine = file.split('\n')[0];
  if (firstLine.includes('template-lint-disable')) {
    const existing = getExistingRules(firstLine);
    const mergedRules = mergeRules(existing, ruleIds);
    writeFileSync(filePath, file.replace(/^.*\n/, `${createIgnoreDeclaration(mergedRules)}\n`));
  } else {
    writeFileSync(filePath, `${createIgnoreDeclaration(ruleIds)}\n${file}`);
  }
}
