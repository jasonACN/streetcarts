/* 
 * This Node.js code handles proxy endpoint calls, passing 
 * them to the data-manager, another Node.js file that 
 * interacts with the data store. 
 */


var dataManager = require('./data-manager');
var express = require('express');
var cors = require('cors');
var app = express();
var apigee = require('apigee-access'); 

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());


// foodcarts proxy paths //

app.get('/foodcarts', function (req, res) {

    console.log('GET /foodcarts');
    
    dataManager.getCartList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {
                
                var response = JSON.parse(data);
                var cartData = {
                    foodcarts:[]
                };
                
                for (var i = 0; i < response.foodcarts.length; i++) {
                    cartData.foodcarts.push({
                        "name": response.foodcarts[i].name,
                        "uuid": response.foodcarts[i].uuid,
                        "city": response.foodcarts[i].location.city
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(cartData));
            }
        }
    });
});

app.get('/foodcarts/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /foodcarts/' + uuid);
    
    dataManager.getCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/foodcarts', function (req, res) {

    var requestingUser = req.headers['x-user-uuid'];

    if (requestingUser) {

        var isOwner = dataManager.isOwner(requestingUser, function (error, isOwner) {
            if (error) {
                res.send(error);
            }
            if (isOwner == false) {
                res.send('User doesn\'t have permission to do that.');
            }
            if (isOwner == true) {
                var args = {
                    "newValues": req.body
                };
                dataManager.addNewCart(args, function (error, data) {
                    if (error) {
                        res.send(error);
                    }
                    if (data) {
                        res.set('Content-Type', 'application/json');
                        res.send(data);
                    }
                });
            }
        });
    
    } else {
        res.send('User doesn\'t have permission to do that.');
    }
});


app.put('/foodcarts/:uuid', function (req, res) {

    var cartID = req.params.uuid;
    var requestingUser = req.headers['x-user-uuid'];

    if (requestingUser) {

        var isCartOwner = dataManager.ownsCart(requestingUser, cartID, function (error, isOwner) {
            if (error) {
                res.send(error);
            }
            if (isOwner === false) {
                res.send('User doesn\'t have permission to do that.');
            }
            if (isOwner === true) {
                var uuid = req.params.uuid;
                var args = {
                    "cartUUID": uuid,
                    "newValues": req.body
                };
                
                console.log('PUT /foodcarts/' + uuid);
            
                dataManager.updateDetailsForCart(args, function (error, data) {
                    if (error) {
                        res.send(error);
                    }
                    if (data) {
                        res.set('Content-Type', 'application/json');
                        res.send(data);
                    }
                });
            }
        });
    
    } else {
        res.send('User doesn\'t have permission to do that.');
    }

});

app.delete('/foodcarts/:uuid', function (req, res) {
    var cartUUID = req.params.uuid;
    
    console.log('DELETE /foodcarts/' + cartUUID);

    dataManager.deleteCart(cartUUID, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/foodcarts/:uuid/menus', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /foodcarts/' + uuid + '/menus');
    
    dataManager.getMenusForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/foodcarts/:uuid/reviews', function (req, res) {
    var uuid = req.params.uuid;
    var reviewData = req.body;
    
    console.log('POST /foodcarts/' + uuid + '/reviews');
    
    var args = {
        "cartUUID": uuid,
        "newValues": reviewData
    };

    dataManager.addNewReview(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/foodcarts/:uuid/reviews', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /foodcarts/' + uuid + '/reviews');
    
    dataManager.getReviewsForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/foodcarts/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /foodcarts/' + uuid + '/items');
    
    dataManager.getItemsForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/foodcarts/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('POST /foodcarts/' + uuid + '/items');
    
    var args = {
        "cartUUID": uuid,
        "newValues": req.body
    };
    dataManager.addNewItem(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/foodcarts/:uuid/menus', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('POST /foodcarts/' + uuid + '/menus');
    
    var args = {
        "cartUUID": uuid,
        "newValues": req.body
    };

    dataManager.addNewMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// items proxy paths //

app.get('/items/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /items/' + uuid);
    
    dataManager.getDetailsForItem(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/items/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('PUT /items/' + uuid);
    
    var args = {
        "itemUUID": uuid,
        "newValues": req.body
    };
    dataManager.updateDetailsForItem(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.delete('/items/:uuid', function (req, res) {
    var itemUUID = req.params.uuid;
    
    console.log('DELETE /items/' + itemUUID);

    dataManager.deleteItem(itemUUID, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// menus proxy paths //

app.get('/menus', function (req, res) {

    console.log('GET /menus');
    
    dataManager.getMenuList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {
                var responseData = JSON.parse(data);
                var menuData = {
                    menus:[]
                };
                
                for (var i = 0; i < responseData.menus.length; i++) {
                    menuData.menus.push({
                        "uuid": responseData.menus[i].uuid,
                        "menuName": responseData.menus[i].menuName,
                        "cartName": responseData.menus[i].cartName
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(menudata));
            }
        }
    });
});

app.get('/menus/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /menus/' + uuid);
    
    dataManager.getMenu(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/menus/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /menus/' + uuid + '/items');
    
    dataManager.getItemsForMenu(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/menus/:menu_uuid/items/:item_uuid', function (req, res) {

    var menuUUID = req.params.menu_uuid;
    var itemUUID = req.params.item_uuid;
    
    console.log('GET /menus/' + menuUUID + '/items/' + itemUUID);
    
    var args = {
        "menuUUID": menuUUID,
        "itemUUID": itemUUID
    };    
    dataManager.getDetailsForItemInMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/menus/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('POST /menus/' + uuid + '/items');
    
    var args = {
        "menuUUID": uuid,
        "newValues": req.body
    };

    dataManager.addNewItemToMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var menuUUID = req.params.menu_uuid;
    var itemUUID = req.params.item_uuid;

    console.log('PUT /menus/' + menuUUID + '/items/' + itemUUID);

    var args = {
        "menuUUID": menuUUID,
        "itemUUID": itemUUID
    };
    dataManager.addItemToMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.delete('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var menuUUID = req.params.menu_uuid;
    var itemUUID = req.params.item_uuid;
    
    console.log('DELETE /menus/' + menuUUID + '/items/' + itemUUID);
    
    var args = {
        "menuUUID": menuUUID,
        "itemUUID": itemUUID
    };    
    dataManager.removeItemFromMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// users proxy paths //

app.get('/users', function (req, res) {
    console.log('GET /users');
    
    dataManager.getUserList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {                
                var responseData = JSON.parse(data);
                var userData = {
                    users:[]
                };
                
                for (var i = 0; i < responseData.users.length; i++) {
                    userData.users.push({
                        "username": responseData.users[i].username,
                        "uuid": responseData.users[i].uuid,
                        "email": responseData.users[i].email
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(userData));
            }
        }
    });
});

app.get('/users/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /users/' + uuid);
    
    dataManager.getUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/users/:uuid/foodcarts', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /users/' + uuid + '/foodcarts');
    
    dataManager.getCartsOwnedByUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/users', function (req, res) {
    isOwner = true;
    var userData = req.body;
    
    console.log('POST /users');
    
    if (!req.body.email) {
        email = "Not Given";
    }
    dataManager.registerUser(userData, isOwner, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.delete('/users/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('DELETE /users/' + uuid);
    
    dataManager.deleteUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// reviews proxy paths //

app.get('/reviews/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    
    console.log('GET /reviews/' + uuid);
    
    dataManager.getDetailsForReview(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/reviews/:uuid', function (req, res) {
    var reviewUUID = req.params.uuid;
    console.log('PUT /reviews/' + reviewUUID);
    
    var args = {
        "reviewUUID": reviewUUID,
        "newValues": req.body
    };
    
    dataManager.updateDetailsForReview(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.delete('/reviews/:uuid', function (req, res) {

    var reviewUUID = req.params.uuid;
    
    console.log('DELETE /reviews/' + reviewUUID);

    dataManager.deleteReview(reviewUUID, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


// accesstoken proxy paths //

app.post('/authenticate', function (req, res) {
    var credentials = req.body;
    
    console.log('POST /authenticate');
    
    dataManager.authenticateUser(credentials, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


// Create a server on which to listen for calls.
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});
