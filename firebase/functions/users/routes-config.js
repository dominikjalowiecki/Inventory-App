const { upsert } = require('./controller');
const { isAuthenticated } = require('../auth/authenticated');
const { isAuthorized } = require('../auth/authorized');

module.exports = {
  routesConfig(app) {
    app.post(
      '/users',
      isAuthenticated,
      isAuthorized({ hasRole: ['admin'] }),
      upsert
    );
  },
};
