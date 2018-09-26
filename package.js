Package.describe({
  name: 'jivanysh:react-list-container',
  summary: 'List container for React (16+ support)',
  version: '0.2.0',
  git: 'https://github.com/OMFG5716/react-list-container.git',
});

Package.onUse((api) => {

  api.versionsFrom('METEOR@1.0');

  api.use([
    'mongo',
    'ecmascript@0.4.2',
    'modules@0.5.2',
    'react-meteor-data@0.2.6-beta.16',
    'tmeasday:check-npm-versions@0.1.1',
    'meteorhacks:subs-manager@1.6.4',
  ]);

  api.use([
    'tmeasday:publish-counts@0.7.3',
  ], { weak: true });

  api.mainModule('lib/export.js', 'server');
  api.mainModule('lib/export.js', 'client');

  api.export([
    'CursorCounts',
  ]);

});

Npm.depends({
  'react': '15.6.2',
  'create-react-class': '15.6.3',
  'prop-types': '15.6.2',
});
