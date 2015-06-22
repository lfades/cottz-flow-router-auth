FlowAuth = function () {
	this.controllers = new Mongo.Collection(null);
	this.redirect = 'notFound';
	this.hasPermission = new ReactiveVar(false);
	this.authReady = new ReactiveVar(true);
};

FlowAuth.prototype.allow = function (callback, options) {
	check(callback, Function);

	var controller = {
		action: callback,
		createdAt: (new Date()).getTime()
	};
	if (options) {
		options.except
		? controller.except = options.except
		: controller.only = options.only || options;
		controller.redirect = options.redirect;
	}
	if (typeof controller.only == 'object' && !Array.isArray(controller.only)) {
		var groupId = Random.id(),
		group = controller.only;

		if (!group.auth) group.auth = [];
		group.auth.push(groupId);

		controller.only = groupId;
	}
	this.controllers.insert(controller);
};

FlowAuth.prototype.allows = function (controllers) {
	for (var i = 0, length = controllers.length; i < length; i ++) {
		var c = controllers[i];
		this.allow(c.action, c);
	};
};

FlowAuth.prototype.check = function (path, group, redirect) {
	var authRedirect = this.redirect,
	next = true,
	only = path;

	this.authReady.set(false);
	
	if (group) {
		var auth = [];
		while (group) {
			if (group.auth)
				auth.push(group.auth);
			group = group.parent;
		};
		if (auth.length) {
			auth.unshift(only);
			only = {$in: _.flatten(auth)};
		}	
	}

	this.controllers.find({
		$or: [
			{only: only},
			{except: {$ne: path}, only: null}
		]
	}, {sort: {createdAt: 1}}).forEach(function (route) {
		if (!next) return;

		next = route.action();
		
		if (!next) {
			typeof redirect === 'function'
			? redirect(route.redirect || authRedirect)
			: FlowRouter.go(route.redirect || authRedirect);
		}
	});
	
	this.authReady.set(true);
	this.hasPermission.set(next);
};

FlowAuth.prototype.permissionGranted = function () {
	return this.hasPermission.get();
};

FlowAuth.prototype.ready = function () {
	return this.authReady.get();
};
// ----------------------------------------------------------------------
FlowRouter.Auth = new FlowAuth();