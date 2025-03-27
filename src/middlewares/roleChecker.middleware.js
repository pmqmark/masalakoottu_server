module.exports.roleChecker = (roles=[]) => {
    return (req, res, next) => {
        if (roles?.includes(req?.user?.role)) {
            next()
        } else {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                data: null,
                error: 'UNAUTHORIZED'
            })
        }
    }
}
