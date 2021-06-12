const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//MIDDLEWARE
//-----------
function hasName(request, response, next){
    let {data: {name} = {} } = request.body;
    if (name) {
        response.locals.name = name;
        next();
    }
    next({
        status: 400,
        message: "Dish must include a name"
    })
}

function hasDescription(request, response, next){
    let {data: {description} = {} } = request.body;
    if(description){
        response.locals.description = description;
        next();
    }
    next({
        status: 400,
        message: "Dish must include a description"
    })
}

function hasPrice(request, response, next){
    let {data: {price} = {} } = request.body;
    if (price){
        if(Number(price) > 0){
            response.locals.price = price;
            next();
        } 
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        });
    }
    next({
        status: 400,
        message: "Dish must include a price"
    });
}

function hasImageURL(request, response, next){
    let { data: {image_url} = {} } = request.body;
    if(image_url){
        response.locals.image_url = image_url;
        next();
    }
    next({
        status: 400,
        message: "Dish must include a image_url"
    });
}

function dishExists(request, response, next){
    let {dishId} = request.params;
    let dishFound = dishes.find(dish => dish.id === dishId)
    if (dishFound){
        response.locals.dishFound = dishFound;
        response.locals.dishId = dishId;
        next();
    }
    next({
        status: 404,
        message: `No dish with ID ${dishId} was found.`
    });
}

function idMisMatch(request, response, next){
    let {data: {id} = {}} = request.body;
    if(id){
        let {dishId} = request.params;
        if(id !== dishId){
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        } return next();
    } return next();
}

//Root routes ('/')
function list(request, response, next){
    response.status(200).json({data: dishes})
}

function create(request, response, next){
    let newDish = {
        id: nextId(),
        name: response.locals.name,
        description: response.locals.description,
        price: response.locals.price,
        image_url: response.locals.image_url,
    }
    dishes.push(newDish);
    response.status(201).json({data: newDish})
}

//Routes for ('/:dishId')
function read(resquest, response, next){
    dishFound = response.locals.dishFound;
    response.status(200).json({data: dishFound})
}

function update(request, response, next){
    let dishId = response.locals.dishId;
    let newName = response.locals.name;
    let newDescription = response.locals.description;
    let newPrice = response.locals.price;
    let newImage_url = response.locals.image_url;

    if (typeof newPrice !== 'number'){
        next({
            status: 400,
            message: `price given is not a number.`
        })
    }

    dishes[dishId] = {
        id: dishId,
        name: newName, 
        description: newDescription,
        price: newPrice, 
        image_url: newImage_url
    } 
    
    response.status(200).json({data: dishes[dishId]})
}

module.exports={
    list,
    create: [hasName, hasDescription, hasPrice, hasImageURL, create],
    read: [dishExists, read],
    update: [dishExists, hasName, hasDescription, hasPrice, hasImageURL, idMisMatch, update]
}
