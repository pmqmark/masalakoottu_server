const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianNumberRegex = /^(?:\+91[\s-]?|91[\s-]?)?[6-9]\d{9}$/;
const mobileRegex = /^[6-9]\d{9}$/;
const googleIdRegex = /^\d{21}$/;

module.exports.validateEmail = (email) => {
    return emailRegex.test(email);
};

module.exports.validateMobile = (mobile) => {
    return mobileRegex.test(mobile);
};


module.exports.credTypeFinder = (cred) => {
    if (emailRegex.test(cred)) {
        return 'email';
    }
    else if (mobileRegex.test(cred)) {
        return 'mobile'
    }
    else if (googleIdRegex.test(cred)) {
        return 'googleId'
    }
    else {
        return null
    }
}
