class FlowAuth {
  constructor () {
    this.controllers = new Mongo.Collection(null)
    this.redirect = 'notFound'
    this.hasPermission = new ReactiveVar(false)
    this.authReady = new ReactiveVar(true)
  }
  allow (callback, options) {
    check(callback, Function)

    let controller = {
      action: callback,
      createdAt: (new Date()).getTime()
    }
    if (options) {
      options.except
      ? controller.except = options.except
      : controller.only = options.only || options
      controller.redirect = options.redirect
    }
    if (typeof controller.only == 'object' && !Array.isArray(controller.only)) {
      let groupId = Random.id(),
      group = controller.only

      if (!group.auth) group.auth = []
      group.auth.push(groupId)

      controller.only = groupId
    }
    this.controllers.insert(controller)
  }
  allows (controllers) {
    for (let c of controllers) {
      this.allow(c.action, c)
    }
  }
  check (path, group, redirect) {
    let next = true,
    only = path

    this.authReady.set(false)
    
    if (group) {
      let auth = []
      while (group) {
        if (group.auth)
          auth.push(group.auth)
        group = group.parent
      }
      if (auth.length) {
        auth.unshift(only)
        only = {$in: _.flatten(auth)}
      }
    }

    this.controllers.find({
      $or: [
        {only: only},
        {except: {$ne: path}, only: null}
      ]
    }, {sort: {createdAt: 1}}).forEach(route => {
      if (!next) return

      next = route.action()
      
      if (!next) {
        typeof redirect === 'function'
        ? redirect(route.redirect || this.redirect)
        : FlowRouter.go(route.redirect || this.redirect)
      }
    })
    
    this.authReady.set(true)
    this.hasPermission.set(next)
  }
  permissionGranted () {
    return this.hasPermission.get()
  }
  ready () {
    return this.authReady.get()
  }
}
// ----------------------------------------------------------------------
FlowRouter.Auth = new FlowAuth();