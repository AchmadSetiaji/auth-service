const controller = require('../controllers/users');
const validateToken = require('../../utils').validateToken;

module.exports = (router) => {
    
    //Add new user and Get All User
    router.route('/users')
        .post(controller.add)
        .get(validateToken, controller.getAll); 

    // Get Token with user detail
    router.route('/token')
        .post(controller.login);
};