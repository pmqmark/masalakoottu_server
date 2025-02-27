const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
    const errors = validationResult(req);

    console.log({error: errors.array().map(item => item.msg)})
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array().map(item => item.msg)?.join(', ').replaceAll('.', ', ')
        });
    }
    next();
};

module.exports = {validate}