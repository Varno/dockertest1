var _ = require('underscore'),
    util = require('util'),
    path = require('path'),
    config = require('config'),
    async = require('async'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    validator = require('validator'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var TokenSchema = new mongoose.Schema({
    provider: {type: String, require: true},
    socialId: {type: String, require: true},
    accessToken: {type: String, require: true},
    tokenSecret: String
});

var ProfileInfoSchema = new mongoose.Schema({
    type: {type: String, require: true},
    value: String
});

var UserSchema = new mongoose.Schema({
    email: {type: String, lowercase: true, trim: true, require: true},
    firstName: {type: String, require: true},
    lastName: {type: String, require: true},
    isAdmin: Boolean,
    password: String,
    salt: String,
    tokens: [TokenSchema],
    info: [ProfileInfoSchema],
    created_at: Date,
    updated_at: Date,
    autoLoginHash: String,
    emailActivationToken: String,
    phoneActivationToken: String,
    activatedAt: Date,
    accountState: String,
    activePlan: { type: String, default: "basic" },
    startSubscription: Date,
    endSubscription: Date,
    statusSubscription: String,
    activatedEmail: Boolean,
    activatedPhone: Boolean
});

UserSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });

UserSchema.methods.fullName = function () {
    return util.format('%s %s', this.firstName, this.lastName);
}

UserSchema.methods.getActivePlan = function(){
    return this.activePlan;
};

UserSchema.methods.setActivePlan = function(planName){
    this.activePlan = planName.toLowerCase();
};

UserSchema.methods.isInRole = function (roleName) {
    return this.role == roleName;
}

// Checks complete of speaker account
UserSchema.methods.isComplete = function () {
    var isComplete = validator.isEmail(this.email)
        && !validator.isNull(this.firstName)
        && !validator.isNull(this.lastName)
        && !validator.isNull(this.getInfo(infoTypeEnum.company))
        && !validator.isNull(this.getInfo(infoTypeEnum.postalCode))
        && !validator.isNull(this.getInfo(infoTypeEnum.phone));

    return isComplete;
}

UserSchema.methods.updateSubscription = function(start, end, status){
    this.startSubscription = start;
    this.endSubscription = end;
    this.statusSubscription = status;
};

UserSchema.getSubscription = function(){
    return { start: this.startSubscription, end: this.endSubscription, status: statusSubscription };
};

UserSchema.methods.isShowOrganizer = function () {
    return this.role == roleEnum.organizer;
}

UserSchema.methods.updateInfo = function (infoCollection, callback) {
    if (!infoCollection) return callback();

    var self = this;
    _.each(infoCollection, function (info, index) {
        var infoItem = _.filter(self.info, function (item) {
            return item.type == info.type;
        })[0];

        if (infoItem)
            infoItem.value = info.value;
        else
            self.info.push({type: info.type, value: info.value});
    });

    callback();
}

UserSchema.getAccessToken = function (provider) {
    var token = _.filter(this.tokens, function (item) {
        return item.provider == provider
    })[0];

    return token ? token.accessToken : null;
}

UserSchema.methods.getInfo = function (infoType) {
    var self = this;
    var item = _.filter(self.info, function (item) {
        return item.type == infoType
    })[0];

    return item ? item.value : null;
}

UserSchema.methods.getInfoTypes = function () {
    var self = this;
    var hiddenTypes = ['title', 'briefcase'];
    var types = _.chain(self.info).filter(function (item) {
        return item.value && hiddenTypes.indexOf(item.type) < 0
    }).map(function (item) {
            return item.type
        }).value();
    return types;
}

UserSchema.methods.hasInfo = function (infoType) {
    var self = this;
    var item = _.filter(self.info, function (item) {
        return item.type == infoType
    })[0];
    return item && item.value;
}

UserSchema.methods.setPassword = function (password, callback) {
    var self = this;
    self.salt = crypto.randomBytes(128).toString('base64');
    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        self.password = derivedKey;
        callback();
    });
}
UserSchema.methods.checkPassword = function (password, callback) {
    var self = this;
    if (!self.salt) return callback(false);

    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        callback(self.password == derivedKey);
    });
}

UserSchema.methods.generateAutoLoginToken = function (callback) {
    this.autoLoginHash = crypto.randomBytes(32).toString('hex');
    this.save(function (err) {
        // No need to wait success, since this operation is not critical
    });

    callback(null, this)
}

UserSchema.methods.clearAutoLoginToken = function (callback) {
    delete this.autoLoginHash;
    this.save(function (err) {
        // No need to wait success, since this operation is not critical
    });

    callback(null, this)
}

UserSchema.methods.activatePhone = function (callback) {
    this.phoneActivationToken = null;
    this.activatedPhone = true;
    this.activatedAt = new Date();
    this.save(function (err) {
        callback(err, this);
    });
}

UserSchema.methods.activateEmail = function (callback) {
    this.emailActivationToken = null;
    this.activatedEmail = true;
    this.save(function (err) {
        callback(err, this);
    });
}

var getImageSettingsByType = function (type) {
    switch (type.toLowerCase()) {
        case profileImageTypeEnum.profileImage:
            return config.app.profileImages;
            break;
        case profileImageTypeEnum.coverImage:
            return config.app.profileBackgroundImages;
            break;
        default:
            return {};
            break;
    }
}

UserSchema.methods.isImageEmptyByType = function (type) {
    switch (type.toLowerCase()) {
        case profileImageTypeEnum.profileImage:
            return !this.profileImageUrl;
            break;
        case profileImageTypeEnum.coverImage:
            return !this.backgroundImageUrl;
            break;
        default:
            return true;
            break;
    }
}

UserSchema.methods.getProfileImageUrl = function (type) {
    var settings = getImageSettingsByType(type);
    if (!this.alias) return settings.default;
    return util.format('/%s/%s', this.alias, type);
}

UserSchema.methods.getDefaultProfileImagePath = function (type) {
    var settings = getImageSettingsByType(type);
    return settings.default;
}

UserSchema.methods.getProfileImagePath = function (type) {
    var settings = getImageSettingsByType(type);
    var path = null;
    switch (type.toLowerCase()) {
        case profileImageTypeEnum.profileImage:
            if (this.profileImageUrl) path = this.profileImageUrl;
            break;
        case profileImageTypeEnum.coverImage:
            if (this.backgroundImageUrl) path = this.backgroundImageUrl;
            break;
    }

    return path;
}

UserSchema.methods.isActivated = function () {
    return !!this.activatedAt;
}

UserSchema.methods.shouldShowIntro = function(){
    if(!this.isActivated()) return false;

    var passed = this.introPassed;
    if(!passed){
        this.introPassed = true;
        this.save();
    }
    return !passed;
}


UserSchema.methods.toJson = function () {
    var obj = this.toObject()
    delete obj.password;
    delete obj.salt;
    delete obj.tokens;

    obj.profileImageUrl = this.getProfileImageUrl(profileImageTypeEnum.profileImage);
    obj.backgroundImageUrl = this.getProfileImageUrl(profileImageTypeEnum.coverImage);
    obj.isActivated = this.isActivated();

    return obj
}

module.exports = mongoose.model('User', UserSchema, 'User');