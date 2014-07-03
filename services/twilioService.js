var config = require('config'),
    util = require('util'),
    TwilioClient = require('twilio'),
    resp = new TwilioClient.TwimlResponse();
//callback - function(err)
exports.call = function(toNumber, userId, phoneToken, callback){
    var client = new TwilioClient(config.app.twilio.accountSid, config.app.twilio.authToken),
        //In twilio, account can own multiple phone numbers.
        //From one phone number we can make one call/second. Twilio will queue all the requests.
        //We can increase "concurrency" by using multiple numbers
        fromNumber = config.app.twilio.phoneNumbers[0].number,
        twiMlUrl = util.format(config.app.voiceCallSettings.twiMlEndpoint, userId, phoneToken);
    toNumber = cleanupNumber(toNumber.value);
    client.makeCall({
        to: toNumber,
        from: fromNumber,
        url: twiMlUrl
    }, function(err, responseData) {
        if(err) {
            console.log(err);
            return callback(err);
        }
        callback();
    });
};

exports.callTwiMl = function(authCode){
    var text = util.format(config.app.voiceCallSettings.text, authCode);
    resp.say(text, config.app.voiceCallSettings.voice);
    return resp.toString();
};

function cleanupNumber(dirtyPhone){
    return dirtyPhone.replace(/\s|[()-]/g, '');
}