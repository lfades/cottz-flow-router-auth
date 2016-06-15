Package.describe({
  name: 'cottz:flow-router-auth',
  version: '0.1.1',
  // Brief, one-line summary of the package.
  summary: 'simple way to validate authentications with Flow-Router',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Goluis/cottz-flow-router-auth',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use([
    'ecmascript',
    'tracker',
    'mongo',
    'check',
    'random',
    'reactive-var',
    'kadira:flow-router@2.10.0'
  ]);

  api.addFiles('flow-router-auth.js');
  api.addFiles('client.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');

  api.use('tracker');
  api.use('mongo');
  api.use('reactive-var');
  api.use('meteorhacks:flow-router@1.14.1');

  api.addFiles('flow-router-auth.js');
  api.addFiles('client.js', 'client');
  api.addFiles('tests.js', 'client');
});