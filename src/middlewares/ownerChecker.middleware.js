module.exports.ownerChecker = (userId) => (req, res, next) => {
    const isOwner = req.user.userId === userId;
    const isAdmin = req.user.role === 'admin';

    if (isAdmin || isOwner) {
        next()
    }
    else {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            data: null,
            error: 'UNAUTHORIZED'
        })
    }

}