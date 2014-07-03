var fs = require('fs'),
    util = require('util'),
    _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    crypto = require('crypto'),
    ziptastic = require('ziptastic'),
    config = require('config'),
    validator = require('validator'),
    User = require('../models/user'),
    PassResetToken = require('../models/passResetToken'),
    UserService = require('../services/userService'),
    EmailService = require('../services/emailService'),
    proxyService = require('./proxyService'),
    PasswordGenerator = require('../lib/passwordGenerator').PasswordGenerator,
    uuid = require('uuid'),
    stripeService = require('./stripeService'),
    TwilioService = require('./twilioService');

exports.generatePhoneActivationToken = function (user, callback) {
    if (user.activatedAt) return callback();

    var gen = new PasswordGenerator(4, '1234567890');
    user.phoneActivationToken = gen.Generate();
    user.save(function (err) {
        if (err) return callback(err);
        callback();
    });
}

exports.generateActivationTokenAndSendToUser = function (user, callback) {
    if (user.activatedEmail) return callback();

    user.emailActivationToken = crypto.randomBytes(32).toString('hex');
    user.save(function (err) {
        if (err) return callback(err);

        EmailService.send(
            user.email,
            config.app.emailTemplates.welcomeMessage,
            {
                first_name: user.firstName,
                activation_url: util.format('%s/activate/email/%s', config.app.domain, user.emailActivationToken)
            },
            callback
        );
    });
}

exports.createExternalAccountsAndUpdateProfile = function(user, callback){
        var passwordGenerator = new PasswordGenerator(20),
        userKey = uuid.v4().replace(/-/g, '');
    proxyService.createAccount(userKey,
        function(err){
            if (err) {
                console.log('proxy new acc error');
                console.log(err);
                return callback(err)
            };
            stripeService.createCustomer(user.email, function(err, stripeAccountId){
                if (err) {
                    console.log('stripe new acc error');
                    console.log(err);
                    return callback(err);
                }
                user.info = user.info || [];
                user.info.push({ type: GLOBAL.infoTypeEnum.userKey, value: userKey });
                user.info.push({ type: GLOBAL.infoTypeEnum.stripeAccountId, value: stripeAccountId });
                user.activePlan = config.app.basicPlanName;
                user.save(function(err){
                    callback(err);
                });
            });
        });
};

exports.validateUser = function (email, password, callback) {
    User.findOne({ email: email.toLowerCase() }, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false, { message: 'Incorrect username.' });
        }
        user.checkPassword(password, function (passwordValid) {
            if (passwordValid)
                return callback(null, user);
            else
                return callback(null, false, { message: 'Incorrect password.' });
        });
    });
};

var validateUserByEmail = function (email, userId, callback) {
    var emailRegex = new RegExp(['^', email.trim(), '$'].join(''), 'i');
    var query = { email: emailRegex };
    if (userId) query._id = {$ne: userId};

    User.count(query, function (err, numberOfUsers) {
        if (err) return callback(err);
        var message = numberOfUsers > 0 ? util.format("User with email: %s already exists.", email) : null;
        callback(message ? { message: message } : null);
    });
};

exports.findUserByEmail = function (email, callback) {
    var emailRegex = new RegExp(['^', email.trim(), '$'].join(''), 'i');
    var query = { email: emailRegex };
    User.findOne(query, function (err, user) {
        callback(err, user);
    });
};

exports.findUserByStripeAccountId = function (stripeAccountId, callback) {
    var query = { info: { $elemMatch: { type: "stripeAccountId",  value: stripeAccountId  } } };
    User.findOne(query, function (err, user) {
        callback(err, user);
    });
};

exports.updateUserActivePlan = function(user, planName){
    user.setActivePlan(planName);
    user.save();
}

var getAvatarImage = function (profile) {
    switch (profile.provider) {
        case "facebook":
            return util.format("http://graph.facebook.com/%s/picture?height=200&width=200", profile.id);
        case "twitter":
            var url = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            return url ? url.replace(/_normal./, '.') : null; // Remove _normal part of file name to get fullsized image
        case "linkedin":
            //return util.format("http://api.linkedin.com/v1/people/%s/picture-url?accessToken=%s", profile.id, profile.getAccessToken('linkedin'));
            return "";
        default:
            throw new Error({message: util.format("can`t get image from %s provider.", profile.provider)});
    }
}

var createUserByToken = function (accessToken, tokenSecret, profile, callback) {
    var email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    var firstName = profile.name ? profile.name.givenName : null;
    firstName = firstName ? firstName : profile.displayName;
    var lastName = profile.name ? profile.name.familyName : null;

    //if (eventSession) {
    //    // Override email if invide defined
    //    email = eventSession.speakerInfo.email;
    //    firstName = eventSession.speakerInfo.firstName || firstName;
    //    lastName = eventSession.speakerInfo.lastName || lastName;
    //}

    User.create({
        email: email || '',
        profileImageUrl: getAvatarImage(profile),
        firstName: firstName || '',
        lastName: lastName || '',
        tokens: [
            {
                provider: profile.provider,
                socialId: profile.id,
                accessToken: accessToken,
                tokenSecret: tokenSecret
            }
        ],
        "createdAt": new Date(),
        "updatedAt": new Date()
    }, function (err, user) {
        callback(err, user);
    })
};

var updateUserByToken = function (accessToken, tokenSecret, profile, callback) {
    User.update({"tokens.socialId": profile.id, "tokens.provider": profile.provider},
        {$set: {
            "profileImageUrl": getAvatarImage(profile),
            "tokens.$.accessToken": profile.accessToken,
            "tokens.$.tokenSecret": profile.tokenSecret,
            "updatedAt": new Date()}}
        , function (err, count) {
            if (count == 0) return callback(null, false, {message: "Cant update, token not found"});
            User.findOne({"tokens.socialId": profile.id, "tokens.provider": profile.provider}, callback);
        });
};

exports.getOrCreateUserByToken = function (req, accessToken, tokenSecret, profile, callback) {
    User.findOne({"tokens.socialId": profile.id, "tokens.provider": profile.provider}, function (err, user) {
        if (err) return callback(err);
        if (!user) return createUserByToken(accessToken, tokenSecret, profile, callback)
        else updateUserByToken(accessToken, tokenSecret, profile, callback);
    });
}

exports.getById = function (id, callback) {
    User.findById(id, callback);
}

exports.getByIdAndPhoneToken = function (id, token, callback) {
    var q = { _id: id, phoneActivationToken: token };
    console.log('user and phone token query');
    console.log(q);
    User.findOne(q, function(err, user){
        if(err)
            return callback(err);
        return callback(null, user);
    });
}

exports.getByToken = function (token, callback) {
    User.findOne({ autoLoginHash: token }, callback);
}

exports.getByActivationToken = function (token, callback) {
    User.findOne({ emailActivationToken: token, activatedEmail: null }, callback);
}

exports.validateAlias = function (alias) {
    return /^[A-Za-z0-9\.\-_]+$/.test(alias);
}

exports.createByEmail = function (entity, callback) {
    console.log('creating user');
    console.log(entity);
    async.parallel([
        function (next) {
            validateUserByEmail(entity.email, null, next);
        }],
        function (err) {
            if (err) return callback(err, entity);

            var user = new User({
                email: entity.email,
                firstName: entity.firstName,
                lastName: entity.lastName,
                eventSessionId: entity.eventSessionId,
                accountState: accountStatusEnum.pending
            });

            var info = [
                { type: GLOBAL.infoTypeEnum.phone, value: entity.phone },
                { type: GLOBAL.infoTypeEnum.company, value: entity.company },
                { type: GLOBAL.infoTypeEnum.postalCode, value: entity.postalCode },
                { type: GLOBAL.infoTypeEnum.domains, value: entity.domains }
            ];

            user.setPassword(entity.password, function () {
                user.updateInfo(info, function () {
                    // Update country, state, city here
                    trySearchAndSetUserLocation(user, function (user) {
                        // Skip errors here, since this operation is not critical for user
                        user.save(function (err) {
                            callback(err, user);
                        });
                    });
                });
            });
        }
    )
}

var trySearchAndSetUserLocation = function (user, callback) {
    var postalCode = user.getInfo(GLOBAL.infoTypeEnum.postalCode);
    ziptastic(postalCode, function (err, location) {
        var locationInfo = [];
        if (err || !location) {
            // Skip errors here, since this operation is not critical. Just log them.
            if (err) console.log('Error occured during speaker location get or set:', err);

            // Clear location from info
            user.info = removeFromInfo(user.info,
                [ GLOBAL.infoTypeEnum.country, GLOBAL.infoTypeEnum.state, GLOBAL.infoTypeEnum.city ]);
        } else {
            locationInfo = [
                { type: GLOBAL.infoTypeEnum.country, value: location.country },
                { type: GLOBAL.infoTypeEnum.state, value: location.state },
                { type: GLOBAL.infoTypeEnum.city, value: location.city }
            ];
        }

        user.updateInfo(locationInfo, function () {
            callback(user)
        });
    });
}

exports.getProfilePicturePathByUser = function (user, basePath, callback) {
    getProfilePicturePathForCreate(user._id, basePath, function (err, picturePath) {
        fs.exists(picturePath, function (isExists) {
            callback(null, isExists ? picturePath : null, user);
        });
    });
}

exports.updateProfile = function (user, fields, callback) {

    var validationResult = {}
    if (!isProfileRequestValid(user, fields, validationResult)) {
        return callback(null, null, validationResult.errors);
    }

    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileImages.path, next);
        }],
        function (err) {
            if (err) return callback(err);

            //fields.profileImageUrl = file ? user.getProfileImageUrl('profileImage') : null;
            UserService.updateById(user._id, fields, function (err, user) {
                callback(err, user);
            });
        }
    );
}

var isProfileRequestValid = function (user, profile, /* out */ results) {
    var errors = [];

    var getInfoValue = function (typeName) {
        var info = _.filter(profile.info || [], function (item) {
            return item.type == typeName;
        })[0];

        return info ? info.value : null;
    };

    if (!validator.isEmail(profile.email))
        errors.push('Invalid Email');

    if (validator.isNull(profile.firstName))
        errors.push('Missing required First Name field');

    if (validator.isNull(profile.lastName))
        errors.push('Missing required Last Name field');

    results.errors = errors.length > 0 ? errors : null;

    return results.errors == null;
}

exports.updateProfileImage = function (user, file, callback) {
    if (!isFileSizeValid(file.size, config.app.profileImages.maxFileSizeInBytes))
        return callback({ message: "File too large" });

    if (!isFileExtentionValid(file.name, config.app.profileImages.allowedFileTypes))
        return callback({ message: "Unsupported file can`t be uploaded" });

    var url = user.getProfilePicturePath('profileImage');
    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileImages.path,
                function (err, picturePath) {
                    copyFile(file.path, picturePath, next);
                }
            );
        },
        function (next) {
            User.findOne({_id: user._id}, function (err, user) {
                if (err) return next(err);

                user.profileImageUrl = url;
                user.save(function (err) {
                    next(err);
                });
            })
        }],
        function (err) {
            callback(err, url);
        }
    );
}

exports.updateBackgroundImage = function (user, file, callback) {
    if (!isFileSizeValid(file.size, config.app.profileBackgroundImages.maxFileSizeInBytes))
        return callback({ message: "File too large" });

    if (!isFileExtentionValid(file.name, config.app.profileBackgroundImages.allowedFileTypes))
        return callback({ message: "Unsupported file can`t be uploaded" });

    var url = user.getProfileImageUrl('coverImage');
    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileBackgroundImages.path,
                function (err, picturePath) {
                    copyFile(file.path, picturePath, next);
                }
            );

        },
        function (next) {
            User.findOne({_id: user._id}, function (err, user) {
                if (err) return next(err);

                user.backgroundImageUrl = url;
                user.backgroundImagePosition = null;
                user.save(function (err) {
                    next(err, user);
                });
            })
        }],
        function (err) {
            callback(err, url);
        }
    );
}

exports.updateBackgroundImagePosition = function (position, userId, callback) {
    User.findById(userId, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback(new Error(util.format('User "%s" not found', userId)));

        user.update(
            {
                $set: {
                    'backgroundImagePosition': position,
                    'updatedAt': new Date()
                }
            },
            function (err) {
                callback(err);
            }
        );
    });
}

exports.pauseSubscription = function(userId, callback){
    User.findById(userId, function(err, user){
        if(!user) 
           return callback(new Error("User not found"));
            proxyService.suspendAccount(user.getInfo(GLOBAL.infoTypeEnum.userKey).value,
            function(err){
                if (err) return callback(err);

                user.accountState = GLOBAL.accountStatusEnum.paused;
                user.save(function(err){
                    if (err) return callback(err);
                    callback(null, { statusName: account.statusName });
            });
        })
    });
};

exports.resumeSubscription = function(uerId, callback){
    User.findById(userId, function(err, user){
        if(!user)
            return callback(new Error("User not found"));
        proxyService.resumeAccount(user.getInfo(GLOBAL.infoTypeEnum.userKey).value, user.activePlan, function(err){
            if (err) return callback(err);

            user.accountState = GLOBAL.accountStatusEnum.active;
            user.save(function(err){
                if (err) return callback(err);
                callback(null, { statusName: account.statusName });
            });
        });
    })
}

var getInfo = function (info, infoType) {
    var item = _.filter(info, function (item) {
        return item.type == infoType
    })[0];

    return item ? item.value : null;
}

var removeFromInfo = function (info, infoTypes) {
    return _.filter(info, function (item) {
        return !_.contains(infoTypes, item.type);
    });
}

exports.updateById = function (id, entity, callback) {
    User.findOne({_id: id}, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback(new Error(util.format('UserID "%s" not found', id)));

        async.parallel([
            function (next) {
                validateUserByEmail(entity.email, id, next);
            }],
            function (err) {
                if (err) return callback(err, user);

                user.email = entity.email;
                user.firstName = entity.firstName;
                user.lastName = entity.lastName;
                user.bio = entity.bio;
                user.domains = entity.domains;

                if (entity.profileImageUrl)
                    user.profileImageUrl = entity.profileImageUrl;

                //var needSetLocation = needSetSpeakerLocation(user, entity.info);

                // Remove location fields from entity since user can't update them manually
                var normalizedInfo = removeFromInfo(entity.info,
                    [ GLOBAL.infoTypeEnum.country, GLOBAL.infoTypeEnum.state, GLOBAL.infoTypeEnum.city ]);

                user.updateInfo(normalizedInfo, function () {
                    //if (needSetLocation) {
                    //    trySearchAndSetUserLocation(user, function (user) {
                    //        // Skip errors here, since this operation is not critical
                    //        user.save(function (err, user) {
                    //            callback(err, user);
                    //        });
                    //    });
                    //} else {
                        user.save(function (err, user) {
                            callback(err, user);
                        });
                    //}
                });
            }
        )
    })
}

exports.getByAlias = function (alias, callback) {
    User.findOne({alias: alias.toLowerCase()}, callback);
}

exports.createPassResetToken = function (userId, token, callback) {
    var passResetToken = new PassResetToken({
        userId: userId,
        token: token,
        createdAt: new Date()
    });

    passResetToken.save(callback);
}

exports.lookupByPassResetToken = function (token, callback) {
    PassResetToken.findOne({token: token}, function (err, passResetToken) {
        callback(err, passResetToken ? passResetToken.userId : null);
    });
}

exports.destroyPassResetToken = function (token, callback) {
    PassResetToken.remove({token: token}, callback);
}

exports.sendMessage = function (currentUser, userId, message, callback) {
    User.findOne({_id: userId}, function (err, user) {
        if (err) return callback(err);
        if (!user.email) return callback({message: "Can`t send message: User haven`t specified email."})

        EmailService.send(
            user.email,
            "user-message",
            {
                fullname: currentUser.fullName(),
                email: currentUser.email,
                message: message
            }, callback);
    })
}

exports.getUserDetails = function(userId, callback){
    User.findById(userId, 'firstName lastName', function(err, user){
        if(err)
            return callback(err);
        if(!user)
            return callback(new Error('User does not exist'));
        user = user.toObject();
        user.pixelDomain = config.app.proxyUrl;
        callback(err, user)
    });
};

exports.getUserKey = function(userId, callback){
    User.findById(userId, 'info', function(err, user){
        if(err) return callback(err);
        if(!user)
            return callback(new Error('User does not exist'));
        callback(null, user.getInfo(infoTypeEnum.userKey));
    });
};
exports.getCurrentPlan = function(userId, callback){
    User.findById(userId, 'activePlan activatedAt firstName lastName activatedPhone activatedEmail', function(err, user){
        callback(err, user);
    });
};

exports.getStripeId = function(userId, callback){
    User.findById(userId, 'email info activePlan statusSubscription startSubscription endSubscription',
        function(err, user){
        callback(err, user);
    });
};

var copyFile = function (sourcePath, destinationPath, callback) {
    var fileStream = fs.createReadStream(sourcePath);
    fileStream.pipe(fs.createWriteStream(destinationPath));
    fileStream.on('end', function (err) {
        callback(err);
    });
}

var preventBrowserCaching = function (url) {
    return url + '?r=' + (new Date()).getTime();
}

var ensurePathExistsOrCreate = function (path, callback) {
    fs.exists(path, function (exists) {
        !exists ? fs.mkdirParent(path, callback) : callback();
    });
}

var getProfilePicturePathForCreate = function (userId, basePath, callback) {
    ensurePathExistsOrCreate(basePath, function () {
        callback(null, path.join(basePath, userId.toString()));
    });
}

var isFileExtentionValid = function (fileName, allowedFileTypes) {
    var fileNameParts = fileName.toLowerCase().split('.');
    var fileType = fileNameParts[fileNameParts.length - 1];

    return allowedFileTypes.indexOf(fileType) > -1;
}

var isFileSizeValid = function (fileSize, maxFileSizeInBytes) {
    return fileSize <= maxFileSizeInBytes;
}

var validateAndCheckAlias = function (alias, id, callback) {
    if (!exports.validateAlias(alias)) {
        return callback({ message: 'Invalid alias character(s)' });
    }

    exports.checkAliasExists(alias, id, function (err, isExists) {
        if (err) return callback(err);
        callback(!isExists ? null : {
            message: util.format('User with alias "%s" already exists', alias)
        });
    })
}