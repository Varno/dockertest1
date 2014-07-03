module.exports =
{
    "app": {
        "db": {
            "server": "candidate.0.mongolayer.com",
            "port": 10306,
            "database": "ImageResizer",
            "user":"Admin",
            "password":"D9)2v56=p(hYXjW9mye+",
            "options": {
                "server": {
                    "socketOptions": {
                        "keepAlive": 1
                    }
                }
            }
        },
        "domain": "http://",
        "twilio": {
            "accountSid": "ACd94ab44d688960531e1f239a2543ccfb",
            "authToken": "dc5b6aa893dc413ce12480ddcdcb4610",
            "phoneNumbers": [
                { "number": '+15124360166', "sid": 'PN5096ce3056784da44058cee24b0ae1d8' }
            ]
        },
        "social":{
            "facebook": {
                "appId": "561718233942366",
                "appSecret": "803cbef2ff892ae3155d1720102a1ce5"
            },
            "twitter":{
                "appId": "skT86tZHcamG6Vod7B9WKQ",
                "appSecret": "CfeBfbVdvcMzwmyVeAGeTPkA25AjiGjWwwzQ0kus"
            }
        },
        "sitemapRebuildSchedule": { "hour": [8, 20], "minute": 0 }
    }
}