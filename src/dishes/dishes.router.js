const router = require("express").Router();
const notAllowed = require('../errors/methodNotAllowed')
const controller = require('./dishes.controller');

// TODO: Implement the /dishes routes needed to make the tests pass

router
    .route('/:dishId')
    .get(controller.read)
    .put(controller.update)
    .all(notAllowed)

router
    .route('/')
    .get(controller.list)
    .post(controller.create)
    .all(notAllowed)

module.exports = router;
