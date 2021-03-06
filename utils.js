const jwt = require('jsonwebtoken');
const urlIssuer = process.env.URL_ISSUER;
const secret = process.env.JWT_SECRET;

module.exports = {
    validateToken: (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let status = 200;
        let result = {};

        if (authorizationHeader) {

            const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
            const options = {
                expiresIn: '2d',
                issuer: urlIssuer,
                _id: req.body._id
            };

            try {
                // verify makes sure that the token hasn't expired and has been issued by us
                result = jwt.verify(token, secret, options);

                // Let's pass back the decoded token to the request object
                req.decoded = result;
                // We call next to pass execution to the subsequent middleware
                next();
            } catch (err) {
                // Throw an error just in case anything goes wrong with verification
                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);
            }
        } else {
            result = {
                error: `Authentication error. Token required.`,
                status: 401
            };
            res.status(401).send(result);
        }
    }
};