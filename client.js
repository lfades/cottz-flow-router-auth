FlowRouter.triggers.enter(function (context, redirect) {
	var route = context.route;
	FlowRouter.Auth.check(route.name || route.path, route.group, redirect);
});