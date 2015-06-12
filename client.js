var oldpath = '';

Tracker.autorun(function () {
	FlowRouter.watchPathChange();
	var route = FlowRouter.current().route;
	if (!route) return;

	var path = route.path;
	if (path === oldpath) return;
	oldpath = path; 

	FlowRouter.Auth.check(route.name || path, route.group);
});