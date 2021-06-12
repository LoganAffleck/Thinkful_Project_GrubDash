const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//MIDDLEWARE
function hasDeliverTo(request, response, next){
    let {data: {deliverTo} = {} } = request.body
    if (deliverTo){
        response.locals.deliverTo = deliverTo
        return next();
    }
    next({
        status: 400,
        message: `Order must include a deliverTo`
    })
}

function hasMobileNumber(request, response, next){
  let {data: {mobileNumber} = {} } = request.body
    if (mobileNumber){
        response.locals.mobileNumber = mobileNumber
        return next();
    }
    return next({
        status: 400,
        message: `Order must include a mobileNumber`
    });
}

function hasDishes(request, response, next){
    let {data: {dishes} = {} } = request.body
    if(dishes){
        if(Array.isArray(dishes) && dishes[0]){
            response.locals.dishes = dishes
            return next();
        }
        return next({
            status: 400,
            message: `Order must include at least one dish`
        })
    }
    next({
        status: 400,
        message: `Order must include a dish`
    })
}

function hasStatus(request, response, next){
    let {data: {status} = {} } = request.body
    if (status === 'delivered' || status ==='preparing' || status === 'out-for-delivery' || status === 'pending'){
        response.locals.status = status
        return next();
    }
    return next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    });
}

function validateDish(request, response, next){
    let dishes = response.locals.dishes
    dishes.map((dish, index) => {
        if(!dish.quantity || dish.quantity < 1 || typeof dish.quantity !== 'number'){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    next();
}

function orderExists(request, response, next){
    let {orderId} = request.params
    let findOrder = orders.find(order => order.id === orderId)
    if(!findOrder){
        return next({
            status: 404,
            message: `No order with ID ${orderId} found`
        })
    }
    response.locals.findOrder = findOrder
    response.locals.orderId = orderId;
    return next();
}

function idMisMatch(request, response, next){
    let {data: {id} = {}} = request.body;
    if (id){
        let {orderId} = request.params;
        if(id !== orderId){
            return next({
                status: 400,
                message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
            })
        } return next();
    } return next();
}

function statusIsValid(request, response, next){
    let foundOrder = response.locals.findOrder;
    if (foundOrder.status === 'delivered'){
        return next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    }
    return next()
}

function orderIsNotPending(request, response, next){
   let foundOrder = response.locals.findOrder
   console.log(foundOrder.status)
   if(foundOrder.status !== 'pending'){
    return next({
        status: 400, 
        message: `An order cannot be deleted unless it is pending`
    })
   }
   return next()
}


//Root routes ('/')
function list(request, response, next) {
    response.status(200).json({data: orders})
}

function create(request, response, next) {
    let newDeliver = response.locals.deliverTo;
    let newMobile = response.locals.mobileNumber;
    let dishes = response.locals.dishes;
    let {data: {status} = {} } = request.body

    let newOrder = {
        id: nextId(),
        deliverTo: newDeliver,
        mobileNumber: newMobile,
        status: status,
        dishes: dishes
    }

    orders.push(newOrder)
    response.status(201).json({data: newOrder})
}

//Routes for ('/:orderId')
function read(request, response, next){
    let foundOrder = response.locals.findOrder
    response.status(200).json({data: foundOrder})
}

function update(request, response, next){
    let orderId = response.locals.orderId;
    let newDeliver = response.locals.deliverTo;
    let newMobile = response.locals.mobileNumber;
    let newStatus = response.locals.status;
    let newDishes = response.locals.dishes;

    orders[orderId] = {
        id: orderId,
        deliverTo: newDeliver, 
        mobileNumber: newMobile,
        status: newStatus, 
        dishes: newDishes
    } 

    response.status(200).json({data: orders[orderId]})
}

function remove(request, response, next){
    let orderId = response.locals.orderId
    const index = orders.findIndex(order => order.id === orderId);
    orders.splice(index, 1);
    response.sendStatus(204);
}

module.exports={
    list,
    create: [hasDeliverTo, hasMobileNumber, hasDishes, validateDish, create],
    read: [orderExists, read],
    update: [hasDeliverTo, hasMobileNumber, hasDishes, validateDish, hasStatus, orderExists, statusIsValid, idMisMatch, update],
    remove: [orderExists, orderIsNotPending, remove]
}