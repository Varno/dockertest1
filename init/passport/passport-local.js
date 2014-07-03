var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    UserService = require('../../services/userService');

exports.init = function() {
  passport.use(new LocalStrategy({
          passReqToCallback: true,
          usernameField: 'email',
          passwordField: 'password'
      },
      function(req, email, password, done) {
          UserService.validateUser(email, password, function(err, user, info){
              done(err, user, info);
          });
      }
    ));
};