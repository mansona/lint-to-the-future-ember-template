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

  // check the first line first, if that doesn't match, continue the check on the following lines
  const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/) || template.match(/template-lint-disable(.*?)(--)?\}\}/s);

  const ignoreRules = matched[1].replace('\n', '').split(' ')
    .map(item => item.trim())
    // remove trailing -- from when there is no gaps in comments
    .map(item => item.replace(/--$/, ''))
    .filter(item => item.length);

  return [...new Set(ignoreRules)].sort((a, b) => a.localeCompare(b));
}
