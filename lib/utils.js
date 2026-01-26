/**
 * Takes a string representation of the full template, extracts the `{{template-lint-disable}}` if it is the first line
 * and returns
 * @param {string} template
 * @returns {Array<string>} sorted list of unique lint ignore rules
 */
export function getExistingIgnores(template) {
  const firstLine = template.split('\n')[0];
  if (!firstLine.includes('template-lint-disable')) {
    return [];
  }

  const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/);

  const ignoreRules = matched[1].split(' ')
    .map(item => item.trim())
    // remove trailing -- from when there is no gaps in comments
    .map(item => item.replace(/--$/, ''))
    .filter(item => item.length);

  return [...new Set(ignoreRules)].sort((a, b) => a.localeCompare(b));
}
