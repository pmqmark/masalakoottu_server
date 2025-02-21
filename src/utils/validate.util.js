exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.validateMobile = (mobile) => {
    const indianNumberRegex = /^(?:\+91[\s-]?|91[\s-]?)?[6-9]\d{9}$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);

};
