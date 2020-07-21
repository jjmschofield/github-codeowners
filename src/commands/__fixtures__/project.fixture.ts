/* tslint:disable */
const fs = require('fs');
const path = require('path');

// TODO - this needs breaking up before anything else is added please
// TODO - this probably needs to offer an interface to allow configuration
// Process:
//   A) generate files
//   B) generate git ignore
//   C) generate codeowners (try to create cases for all rules in https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners#codeowners-syntax)
export const generateProject = async (testId: string) => {
  const workingDir = path.resolve('tests', 'scratch', testId);

  // Create files
  const files = [
    { path: 'README.md' },
    { path: 'src/index.js' },
    { path: 'build/logs/log.log' },
    { path: 'apps/some-file.ts' },
    { path: 'apps/some-file.js' },
    { path: 'docs/SOMEDOC.md' },
    { path: 'docs/SOMEDOC.md' },
    { path: 'deep/docs/SOMEDOC.md' },
    { path: 'deep/build/logs/log.log' },
    { path: 'deep/apps/some-file.js' },
    { path: 'deep/apps/some-file.ts' },
    { path: 'node_modules/ignored.js' }
  ];

  for (const file of files) {
    const dir = path.join(workingDir, path.dirname(file.path));
    const fileName = path.basename(file.path);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(path.join(dir, fileName), 'some line');
  }

  // Create git ignore
  const gitIgnore = `node_modules`;
  await fs.promises.writeFile(path.join(workingDir, '.gitignore'), gitIgnore);

  // Create codeowners
  const codeowners = `
# These owners will be the default owners for everything in
# the repo. Unless a later match takes precedence,
# @global-owner1 and @global-owner2 will be requested for
# review when someone opens a pull request.
*       @global-owner1 @global-owner2

# Order is important; the last matching pattern takes the most
# precedence. When someone opens a pull request that only
# modifies JS files, only @js-owner and not the global
# owner(s) will be requested for a review.
*.js    @js-owner

# In this example, @doctocat owns any files in the build/logs
# directory at the root of the repository and any of its
# subdirectories.
/build/logs/ @doctocat

# The \`docs/*\` pattern will match files like
# \`docs/getting-started.md\` but not further nested files like
# \`docs/build-app/troubleshooting.md\`.
docs/*  docs@example.com

# In this example, @octocat owns any file in an apps directory
# anywhere in your repository.
apps/ @octocat

# In this example, @doctocat owns any file in the \`/docs\`
# directory in the root of your repository.
/docs/ @doctocat
    `;

  await fs.promises.mkdir(path.join(workingDir, '.github'), { recursive: true });
  await fs.promises.writeFile(path.join(workingDir, '.github', 'CODEOWNERS'), codeowners);

  return workingDir;
};
