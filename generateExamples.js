/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const rimraf = require('rimraf');
const {readFileSync, writeFileSync, readdir} = require('fs');
const {execSync} = require('child_process');

// Generate one example per init template
// We use those generated examples as CodeSandbox projects
// See https://github.com/facebook/docusaurus/issues/1699
function generateTemplateExample(template) {
  try {
    console.log(
      `generating ${template} template for codesandbox in the examples folder...`,
    );

    // run the docusaurus script to bootstrap the template in the examples folder
    execSync(
      // /!\ we use the published init script on purpose,
      // because using the local init script is too early and could generate upcoming/unavailable config options
      // remember CodeSandbox templates will use the published version, not the repo version
      `npx @docusaurus/init@next init examples/${template} ${template}`,
      // `node ./packages/docusaurus-init/bin/index.js init examples/${template} ${template}`,
      {
        stdio: 'inherit',
      },
    );

    // read the content of the package.json
    const templatePackageJson = JSON.parse(
      readFileSync(`examples/${template}/package.json`, 'utf8'),
    );

    // attach the dev script which would be used in code sandbox by default
    templatePackageJson.scripts.dev = 'docusaurus start';

    // rewrite the package.json file with the new edit
    writeFileSync(
      `./examples/${template}/package.json`,
      JSON.stringify(templatePackageJson, null, 2),
    );

    // create sandbox.config.json file at the root of template
    const sandboxConfigContent = {
      infiniteLoopProtection: true,
      hardReloadOnChange: true,
      view: 'browser',
      template: 'node',
    };

    writeFileSync(
      `./examples/${template}/sandbox.config.json`,
      JSON.stringify(sandboxConfigContent, null, 2),
    );

    console.log(`Generated example for template ${template}`);
  } catch (error) {
    console.error(`Failed to generated example for template ${template}`);
    throw error;
  }
}

// delete the examples directory if it exists
rimraf.sync('./examples');

// get the list of all available templates
readdir('./packages/docusaurus-init/templates', (err, data) => {
  const templates = data.filter((i) => i !== 'README.MD');
  templates.forEach(generateTemplateExample);
});
