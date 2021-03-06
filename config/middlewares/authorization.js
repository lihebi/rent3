
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
}

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/users/' + req.profile.id)
    }
    next()
  }
}

exports.bicycle = {
    hasAuthorization: function (req, res, next) {
        if (req.bicycle.owner._id != req.user.id) { //TODO ?
            req.flash('info', 'You are not authorized');
            return res.redirect('/cars/'+req.car.id);
        }
        next();
    }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
      next()
    } else {
      req.flash('info', 'You are not authorized')
      res.redirect('/articles/' + req.article.id)
    }
  }
}
exports.carcomment = {
    hasAuthorization: function (req, res, next) {
        if (req.user.id === req.comment.user.id || req.user.id === req.car.user.id) {
            next();
        } else {
            req.flash('info', 'You are not authorized');
            res.redirect('/cars/'+req.car.id);
        }
    }
};
