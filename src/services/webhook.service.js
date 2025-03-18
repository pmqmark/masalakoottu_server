const crypto = require('crypto');

exports.verifyPhonePeHash = async (phonePeHash) => {
    const username = process.env.PG_USERNAME;
    const password = process.env.PG_PASSWORD;

    const data = `${username}:${password}`
    const hash = crypto.createHash('sha256').update(data).digest('hex')

    if (hash === phonePeHash) {
        return true
    }
    else {
        return false
    }
}
