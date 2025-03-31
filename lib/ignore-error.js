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

export default function ignoreError(errorInput, file, filePath) {
  let errors = errorInput.results ?? errorInput;
  const isTemplateFile = filePath.endsWith('.gjs') || filePath.endsWith('.gts');

  if (isTemplateFile) {
    try {
      const transformer = new Transformer(file);

      transformer.map((templateContent) => {
        // Get errors specific to this template block by matching the error source with the template content
        const templateErrors = errors.filter(error => {
          const errorLine = error.source?.trim();
          if (!errorLine) return false;
          return templateContent.includes(errorLine);
        });

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
