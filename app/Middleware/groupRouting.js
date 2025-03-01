const groupRouting = (expressRoute, path, middleware, routes) => {
    if (middleware) {
        if (Array.isArray(middleware)) {
            middleware.forEach(item => {
                expressRoute.use(item);
            });
        } else {
            expressRoute.use(middleware);
        }
    }
    routes(expressRoute);
    expressRoute.use(path, expressRoute);
};

module.exports = groupRouting;