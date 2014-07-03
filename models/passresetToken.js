var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    config = require('config');

var PassResetTokenSchema = new mongoose.Schema({
    userId: ObjectId,
    token: String,
    createdAt: Date
});

PassResetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: config.app.forgotPassword.expireTimeoutInHours * 60 * 60 });

module.exports = mongoose.model('PassResetToken', PassResetTokenSchema, 'PassResetToken');