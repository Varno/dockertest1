exports.init = function(){
    GLOBAL.roleEnum = {
        organizer: "organizer",
        speaker: "speaker"
    };

    GLOBAL.infoTypeEnum = {
        postalCode: "postalCode",
        company: "company",
        position: "position",
        phone: "phone",
        domains: "domains",
        webSite: "webSite",
        country: "country",
        state: "state",
        city: "city",
        userKey: "userKey",
        stripeAccountId: "stripeAccountId"
    };

    GLOBAL.subscriptionStateEnum = {
        paused: "paused",
        active: "active"
    };

    GLOBAL.eventStatusEnum = {
        empty: 'empty',
        paymentPending: 'paymentPending',
        paymentComplete: 'paymentComplete'
    }

    GLOBAL.profileImageTypeEnum = {
        profileImage: 'profileimage',
        coverImage: 'coverimage'
    };

    GLOBAL.accountStatusEnum = {
        pending: 'pending',
        paused: 'paused',
        active: 'active'
    };
}
