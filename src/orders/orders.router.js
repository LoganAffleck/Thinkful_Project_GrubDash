const router = require("express").Router();
const notAllowed = require('../errors/methodNotAllowed')
const controller = require('./orders.controller');

// TODO: Implement the /orders routes needed to make the tests pass

router
    .route('/:orderId')
    .get(controller.read)
    .put(controller.update)
    .delete(controller.remove)
    .all(notAllowed)

router
    .route('/')
    .get(controller.list)
    .post(controller.create)
    .all(notAllowed)

module.exports = router;
