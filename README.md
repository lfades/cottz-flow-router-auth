# cottz-flow-router-auth
simple way to validate authentications with Flow-Router

## Installation
```shell
meteor add cottz:flow-router-auth
```

## Getting Started
```js
FlowRouter.route('/admin', {
  action: function () {
    // some code...
  }
});

// default route if no one is delivered from the controller
FlowRouter.redirect = '/notFound';

FlowRouter.Auth.newController(function () {
  return true;
}, '/admin');
```
###

## API
All these methods are within FlowRouter.Auth

### newController (action, options)
create a new controller for a route or group of routes, **action** is the function to be executed. **options** is one of three values: an objetc with `only` or `except` and `redirect`, a string that means 'only' or nothing and the controller will run in all routes.
If **action** returns false quickly redirect and the following controllers will not run
```js
// only for /admin
FlowRouter.Auth.newController(function () {
  return true;
}, {only: '/admin'}) // only can be also array

// on all routes except for /admin
FlowRouter.Auth.newController(function () {
  return true;
}, {except: '/admin'}) // except can be also an array

// only for /admin
FlowRouter.Auth.newController(function () {
  return true;
}, '/admin');

// Run in all routes
FlowRouter.Auth.newController(function () {
  return true;
})

// Redirect to /notFound
FlowRouter.Auth.newController(function () {
  return true;
}, {redirect: '/notFound'});
```
### newControllers (controllers)
**controllers** is an array of objects, action is the function to be executed and the remaining options are equal to the options from `newController`
```js
FlowRouter.Auth.newControllers([
  {
    action: function () {
      return true;
    },
    only: '/admin'
  },
  {
    action: function () {
      return true;
    }
  }
]);
```
### permissionGranted ()
returns true if all controllers passed
```js
Tracker.autorun(function () {
  if (FlowRouter.Auth.permissionGranted())
    console.log('Good job, kid');
});
// you could create a helper and combine it with templates
Template.registerHelper('permissionsGranted', function () {
  return FlowRouter.Auth.permissionGranted();
});
```
```html
<template name="layout">
  {{#if permissionsGranted }}
    {{> Template.dynamic template='VIPzone' }}
  {{ else }}
    not authorized to the VIP zone
  {{/if}}
</template>
```

### ready()
returns true if there is no controller running
```js
// Example
Template.registerHelper('authReady', function () {
  return FlowRouter.Auth.ready();
});
```
```html
<template name="layout">
  {{#if permissionsGranted }}
    {{> Template.dynamic template='VIPzone' }}
  {{ else }}
    {{#if authReady }}
      not authorized to the VIP zone
    {{ else }}
      checking if you're on the list
    {{/if}}
  {{/if}}
</template>
```
