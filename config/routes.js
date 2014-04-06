/**
 * @file route.js
 */
var async = require('async')

var users = require('../app/controllers/users')
, bicycles = require('../app/controllers/bicycles')
, auth = require('./middlewares/authorization')

var userAuth = [auth.requiresLogin, auth.user.hasAuthorization]
var bicycleAuth = [auth.requiresLogin, auth.bicycle.hasAuthorization]

module.exports = function (app, passport) {

    app.get('/', bicycles.index);
    app.param('userId', users.load);
    app.param('bicycleId', bicycles.load);

    // user routes
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout);
    app.post('/users', users.create);
    app.post('/users/session',
            passport.authenticate('local', {
                failureRedirect: '/login',
                failureFlash: 'Invalid email or password.'
            }), users.session);
    app.get('/users/:userId', users.show);


    app.get('/bicycles', bicycles.index);
    app.get('/bicycles/new', auth.requiresLogin, bicycles.new);
    app.post('/bicycles', auth.requiresLogin, bicycles.create);
    app.get('/bicycles/:bicycleId', bicycles.show);
    app.get('/bicycles/:bicycleId/edit', bicycleAuth, bicycles.edit);
    app.put('/bicycles/:bicycleId', bicycleAuth, bicycles.update);
    app.del('/bicycles/:bicycleId', bicycleAuth, bicycles.destroy);

    app.get('/bicycles/:bicycleId/order', auth.requiresLogin, bicycles.order);
    app.post('/bicycles/:bicycleId/order', auth.requiresLogin, bicycles.createOrder);
}
