FlowAuth = function () {
	this.controllers = new Mongo.Collection(null);
	this.redirect = 'notFound';
	this.hasPermission = new ReactiveVar(false);
	this.authReady = new ReactiveVar(true);
};

FlowAuth.prototype.newController = function (callback, where) {
	check(callback, Function);
	check(where, Match.Optional(Match.OneOf(Object, String)));

	var options = {
		action: callback,
		createdAt: (new Date()).getTime()
	};
	if (where) {
		if (typeof where == 'string')
			options.only = where;
		else {
			where.except
			? options.except = where.except
			: options.only = where.only || null;
			options.redirect = where.redirect;
		}
	}
	this.controllers.insert(options);
};

FlowAuth.prototype.newControllers = function (controllers) {
	for (var i = 0, length = controllers.length; i < length; i ++) {
		var c = controllers[i];
		this.newController(c.action, c);
	};
};

FlowAuth.prototype.callControllers = function (path) {
	var controllers = [],
	redirect = this.redirect,
	next = true;

	this.authReady.set(false);
	
	this.controllers.find({
		$or: [
			{only: path},
			{except: {$ne: path}, only: null}
		]
	}, {sort: {createdAt: 1}}).forEach(function (route) {
		if (!next) return;

		next = route.action();
		if (!next)
			FlowRouter.go(route.redirect || redirect);
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
var currentRoute = new ReactiveVar('');

Tracker.autorun(function () {
	FlowRouter.watchPathChange();
	var route = FlowRouter.current().route;
	if (route)
		currentRoute.set(route.name || route.path);
});

Tracker.autorun(function () {
	var route = currentRoute.get();
	if (!route) return;
	
	FlowRouter.Auth.callControllers(route);
});

FlowRouter.Auth = new FlowAuth();