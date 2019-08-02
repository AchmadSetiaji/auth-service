const mongoose = require('mongoose');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient(6379)
const connUri = process.env.MONGO_LOCAL_CONN_URL;
const urlIssuer = process.env.URL_ISSUER;

module.exports = {

    add: (req, res) => {

        mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {

            let result = {};
            let status = 201;

            if (!err) {

                const name = req.body.name;
                const password = req.body.password;
                const accountNumber = req.body.accountNumber;
                const emailAddress = req.body.emailAddress;
                const identityNumber = req.body.identityNumber;
                const user =
                    new User({ name, password, accountNumber, emailAddress, identityNumber });

                user.save((err, user) => {

                    if (!err) {

                        result.status = status;
                        result.result = user;

                    } else {

                        status = 500;
                        result.status = status;
                        result.error = err;

                    }

                    res.status(status).send(result);
                });
            } else {

                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);

            }
        });
    },

    requestToken: (req, res) => {

        const { name, password } = req.body;

        mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {

            let result = {};
            let status = 200;
            if (!err) {
                User.findOne({ name }, (err, user) => {

                    if (!err && user) {

                        bcrypt.compare(password, user.password).then(match => {

                            if (match) {

                                // Create a token
                                const payload = { user: user.name };
                                const options = { expiresIn: '2d', issuer: urlIssuer };
                                const secret = process.env.JWT_SECRET;
                                const token = jwt.sign(payload, secret, options);

                                // console.log('TOKEN', token);
                                result.status = status;
                                result.token = token;

                            } else {

                                status = 401;
                                result.status = status;
                                result.error = 'Authentication error';

                            }

                            res.status(status).send(result);

                        }).catch(err => {

                            status = 500;
                            result.status = status;
                            result.error = err;
                            res.status(status).send(result);

                        });

                    } else {

                        status = 404;
                        result.status = status;
                        result.error = err;
                        res.status(status).send(result);

                    }
                });

            } else {

                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);

            }
        });
    },

    getAll: (req, res) => {

        mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {

            const redisKey = 'user:all';

            if (!err) {

                let result = {};
                let status = 200;
                console.log(req.body);

                return redisClient.get(redisKey, (err, users) => {

                    if (users) {

                        result.status = status;
                        result.error = err;
                        result.result = JSON.parse(users);
                        res.status(status).send(result);

                    } else {

                        User.find({}, (err, users) => {

                            if (!err) {

                                redisClient.setex(redisKey, 3600, JSON.stringify(users));
                                result.status = status;
                                result.error = err;
                                result.result = users;

                            } else {

                                status = 500;
                                result.status = status;
                                result.error = err;

                            }

                            res.status(status).send(result);

                        });
                    }

                });
            } else {

                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);

            }
        });

    }
}