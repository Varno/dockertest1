module.exports =
{
    "app": {
        "siteName": "Image Resizer",
        "domain": "http://localhost:3000",
        "pixelDomain": "http://localhost:8080/api/proxy",
        "resizerDomain": "http://resizer.231.quotient.net",
        "resizerApiVersion": "v1",
        "cookieSecret": "\SHK3t=T%B8#Az1",
        "sessionUploadPath": "/data/sessionContent",
        "version": "1.0.0.1",
        "allowApiCallsFrom": ['127.0.0.1'],
        "workerAccessToken": "rtboinoxoewqndivn33dfnseojpxfpbcxzcdwq435ewmsac",
        "imageResizerEmails": {
            "support": "support@imageresizer.com"
        },
        "eventRegistrationUrl": "http://localhost:3000/event/register?user_key=%s",
        "db": {
            "server": "localhost",
            "port": 27017,
            "database": "ImageResizer",
            "options": {
                "server": {
                    "socketOptions": {
                        "keepAlive": 1
                    }
                }
            }
        },
        "profileImages": {
            "path": "data/profileImages",
            "allowedFileTypes": ["png", "jpg", "jpeg", "bmp", "tiff"],
            "maxFileSizeInBytes": 1819200,
            "default": "/assets/img/default-avatar.png"
        },
        "profileBackgroundImages": {
            "path": "data/profileBackgroundImages",
            "allowedFileTypes": ["png", "jpg", "jpeg", "bmp", "tiff"],
            "maxFileSizeInBytes": 1819200,
            "default": "/assets/others/img/cover_pic.png"
        },
        "email": {
            "host": "smtp.mandrillapp.com",
            "port": "587",
            "secureConnection": false,
            "user": "john.curtis@speakerstack.com",
            "password": "cYm9F0PChGtK0w9b96i3cQ",
            "from": "system@imageresizer.com"
        },
        "forgotPassword": {
            "expireTimeoutInHours": 12,
            "minPasswordLength": 6,
            "callbackUrl": "password/reset/{token}",
            "emailSubject": "ImgSrc password reset"
        },
        "deniedAliases": ["profile", "login", "logout", "showorg"],
        "rememberPassword": {
            "maxAgeInMilliseconds": 604800000,
            "cookieName": "token"
        },
        "airbrake": {
            "apiKey": "baafa6994221fb9ea6543c6e63186120",
            "projectId": "97195",
            "projectEnvironment": "production"
        },
        "ironMQ": {
            "token": "DjKP3d9X6Xuret1x31n_VVZjePg",
            "projectId": "535a27c907f5b50009000048",
            "queues": {
                "emailQueue": {"name": "email_queue", "delay": 0},
                "notify": {"name": "notify", "delay": 300}
            }
        },
        "twilio": {
            "accountSid": "ACd94ab44d688960531e1f239a2543ccfb",
            "authToken": "dc5b6aa893dc413ce12480ddcdcb4610",
            "phoneNumbers": [
                { "number": '+15124360166', "sid": 'PN5096ce3056784da44058cee24b0ae1d8' }
            ]
        },
        "voiceCallSettings": {
            "text": "Thank you for signing up for Image Source. Please enter the following code on our website to activate your account: %s",
            //first %s - userId
            //second %s - authentication token for voice call
            //If token is incorrect for given user, requester will see 404 error
            "twiMlEndpoint": "http://resizerportal.231.quotient.net/api/v1/twilio/twiml/%s/%s",
            "authorizeEndpoint": "http://resizerportal.231.quotient.net/activate/phone/%s",
            "voice": {
                "voice": 'woman',
                "language": 'en-gb'
            }
        },
        "ironWorker": {
            "emailer": {
                "url": "https://worker-aws-us-east-1.iron.io:443/2/projects/535a27c907f5b50009000048/tasks/webhook?code_name=emailer_worker&oauth=DjKP3d9X6Xuret1x31n_VVZjePg"
            }
        },
        "emailTemplates": {
            "welcomeMessage": "ImgSrc - Welcome to",
            "limitUsageNotifyTemplates": [
                {
                    "name": "ImgSrc - 90% Usage Email",
                    "usagePercent": 90
                },
                {
                    "name": "ImgSrc - 95% Usage Email",
                    "usagePercent": 95
                },
                {
                    "name": "ImgSrc - 100% Usage Email",
                    "usagePercent": 100
                }
            ],
            "passwordReset": "ImgSrc - Password Reset"
        },
        //all prices
        "tariffs": [
            {
                "name": "Basic",
                //ToDo: rename to key
                "nameLowercase": "free",
                "price": 0,
                "limits": {
                    "hits": { "limit": 50000, "period": "month", "displayType": "numericAcronym" },
                    "bandwidth": { "limit": 1073741824, "period": "month", "displayType": "volume" },
                    "storage": { "limit": 524288000, "displayType": "volume" }
                },
                "period": "month",
                "stripePlanName": "ResizerBasic"
            },
            {
                "name": "Startup",
                //ToDo: rename to key
                "nameLowercase": "basic",
                "price": 3900,
                "limits": {
                    "hits": { "limit": 1000000, "period": "month", "displayType": "numericAcronym" },
                    "bandwidth": { "limit": 42949672960, "period": "month", "displayType": "volume" },
                    "storage": { "limit": 10737418240, "displayType": "volume" }
                },
                "period": "month",
                "stripePlanName": "ResizerStartup"
            },
            {
                "name": "Growth",
                //ToDo: rename to key
                "nameLowercase": "plus",
                "price": 9900,
                "limits": {
                    "hits": { "limit": 4000000, "period": "month", "displayType": "numericAcronym" },
                    "bandwidth": { "limit": 171798691840, "period": "month", "displayType": "volume" },
                    "storage": { "limit": 42949672960, "displayType": "volume"  }
                },
                "period": "month",
                "stripePlanName": "ResizerGrowth"
            },
            {
                "name": "Enterprise",
                //ToDo: rename to key
                "nameLowercase": "advanced",
                "price": 21900,
                "limits": {
                    "hits": { "limit": 10000000, "period": "month", "displayType": "numericAcronym" },
                    "bandwidth": { "limit": 429496729600, "period": "month", "displayType": "volume" },
                    "storage": { "limit": 107374182400, "displayType": "volume" }
                },
                "period": "month",
                "stripePlanName": "ResizerEnterprise"
            }
        ],
        //ToDo: rename to freePlanKey
        "basicPlanName": 'free',
        "stripe": {
            "secretKey": "sk_test_Dp0UbdvQ7j6Wh7QeOHG16xoE",
            "publicKey": "pk_test_GLQTljQo28rUyihJwLikWvPW"
        },
        "proxyServiceBaseUrl": "http://localhost:8080/api",
        "proxyUrl": "http://localhost:8080/api/proxy",
        "social":{
            "facebook": {
                "appId": "561718233942366",
                "appSecret": "803cbef2ff892ae3155d1720102a1ce5"
            },
            "twitter": {
                "appId": "e66lavvT1eYBYLX2WEsgA",
                "appSecret": "U681Nxum1Kms92t7V5lICPWibvgHXly401CFZrfhBt8"
            }
        }
    }
}