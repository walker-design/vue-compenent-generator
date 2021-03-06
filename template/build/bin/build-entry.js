const fs = require('fs');
const path = require('path');
const tips = '// This file is auto generated by build/bin/build-entry.js';
const readFile = require('fs-readdir-recursive');
const camelCase = require('camelcase');

function buildDemoEntry() {
    const dir = path.join(__dirname, '../../docs/demos');
    const demos = readFile(dir)
        .filter(name => name.indexOf('.vue') !== -1)
        .map(name => name.replace('.vue', '').replace('\\', '/'))
        .map(name => {
            const routerName = camelCase(name.replace(/\//g, '-')),
                arr = name.split('/'),
                componentName = arr[arr.length - 1]
            return `'${routerName}': asyncWrapper(r => require.ensure([], () => r(componentWrapper(require('./${name}'), '${componentName}')), '${routerName}'))`
        })

    const content = `${tips}
import progress from 'nprogress';

function asyncWrapper(component) {
  return function(r) {
    progress.start();
    component(r).then(() => {
      progress.done();
    }).catch(() => {
      progress.done();
    });
  };
}

function componentWrapper(component, name) {
  component = component.default;
  component.name = 'demo-' + name;
  return component;
}

export default {
  ${demos.join(',\n  ')}
};
`;
    fs.writeFileSync(path.join(dir, './index.js'), content);
}

function buildDocsEntry() {
    const dir = path.join(__dirname, '../../docs/mds');
    const docs = readFile(dir)
        .filter(name => name.indexOf('.md') !== -1)
        .map(name => name.replace('.md', '').replace('\\', '/'))
        .map(name => {
            const routerName = camelCase(name.replace(/\//g, '-'))
            return `'${routerName}': wrapper(r => require.ensure([], () => r(require('./${name}.md')), '${routerName}'))`
        })

    const content = `${tips}
import progress from 'nprogress';

function wrapper(component) {
  return function(r) {
    progress.start();
    component(r).then(() => {
      progress.done();
    }).catch(() => {
      progress.done();
    });
  };
}

export default {
  ${docs.join(',\n  ')}
};
`;
    fs.writeFileSync(path.join(dir, './index.js'), content);
}

buildDemoEntry();
buildDocsEntry();
