module.exports =
{
    "app": {
        "db": {
            "server": "candidate.0.mongolayer.com",
            "port": 10306,
            "database": "ImageResizerBETA",
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
            "accountSid": "AC952222e7985f446283a3f1fc00534f1b",
            "authToken": "f45f5516ce24f35f067a9cee12ff9dbd",
            "phoneNumbers": [
                { "number": '+15124360166', "sid": 'PN5096ce3056784da44058cee24b0ae1d8' }
            ]
        },
        "social":{
            "facebook": {
                "appId": "",
                "appSecret": ""
            },
            "twitter":{
                "appId": "",
                "appSecret": ""
            }
        },
        "sitemapRebuildSchedule": { "hour": [8, 20], "minute": 0 }
    }
}