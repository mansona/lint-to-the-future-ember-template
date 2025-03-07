import { createRequire } from 'module';
import { globbySync } from 'globby';
import { dirname, relative, join } from 'path';

const require = createRequire(import.meta.url);

export default async function getFiles(cwd, providedGlob) {
  let globs;

  if (providedGlob) {
    globs = [providedGlob];
  } else {
    globs = ['**/*.hbs', '**/*.gjs', '**/*.gts'];
  }

  // globby's ignore functionality works by getting all glob matches and _then_ filtering them.
  // We always ignore node_modules here since we'll never want it and it can be a huge performance hit
  // to include it.
  globs.push('!**/node_modules');

  const files = globbySync(globs, {
    cwd,
    gitignore: true,
  });

  const configFiles = globbySync(['**/.template-lintrc.{js,cjs,mjs}', '!**/node_modules'], {
    cwd,
    gitignore: true,
  });

  for (const configFile of configFiles) {
    const config = await import(require.resolve(`./${configFile}`, { paths: [cwd]}));
    if (!config.default.ignore) {
      continue;
    }

    const dir = dirname(configFile);
    const prefix = relative(cwd, dirname(configFile));

    const ignoredFiles = globbySync([...config.default.ignore, '!**/node_modules'], {
      cwd: dir,
    });

    for (const ignoredFile of ignoredFiles) {
      const index = files.indexOf(join(prefix, ignoredFile));
      if (index !== -1) {
        files.splice(index, 1);
      }
    }
  }

  return files;
};
