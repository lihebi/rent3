/**
 * @file controllers/bicycle.js
 */

var mongoose = require('mongoose')
    , Bicycle = mongoose.model('Bicycle')
    , Order = mongoose.model('Order')
    , utils = require('../../lib/utils')
    , extend = require('util')._extend;

exports.load = function(req, res, next, id) {
    Bicycle.load(id, function(err, bicycle) {
        if (err) return next(err);
        if (!bicycle) return next(new Error('not found'));
        //This is where the req.bicycle becomes available
        req.bicycle = bicycle;
        next();
    });
};

exports.new = function(req, res) {
    res.render('bicycles/new', {
        title: '添加新车',
        bicycle: new Bicycle()
    });
};

exports.create = function(req, res) {
    var bicycle = new Bicycle(req.body);
    bicycle.owner = req.user;
    var cb = function(err) {
        if (err) {
            exports.edit(req, res);
        }
        req.flash('info', '成功创建新的单车');
        return res.redirect('/bicycles/'+bicycle._id);
    };
    if (req.files.image.originalFilename) {
        bicycle.moveAndSave(req.files.image, cb);
    } else {
        bicycle.save(cb);
    }
};

exports.index = function(req, res) {
    var page = (req.param('page')>0 ? req.param('page') : 1) -1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };
    Bicycle.list(options, function(err, bicycles) { //TODO in model
        if (err) return res.render('500');
        Bicycle.count().exec(function(err, count) {
            res.render('bicycles/index', {
                title: '单车列表',
                bicycles: bicycles,
                page: page + 1,
                pages: Math.ceil(count/perPage)
            });
        });
    });
};

exports.edit = function(req, res) {
    res.render('bicycles/edit', {
        title: '更新车辆信息',
        bicycle: req.bicycle
    });
};

exports.update = function(req, res) {
    var bicycle = req.bicycle;
    bicycle = extend(bicycle, req.body);
    var cb = function(err) {
        if (err) {
            exports.edit(req, res);
        }
        return res.redirect('/bicycles/'+bicycle._id);
    };
    if (req.files.image.originalFilename) {
        bicycle.moveAndSave(req.files.image, cb);
    } else {
        bicycle.save(cb);
    }
};

exports.show = function(req, res) {
    res.render('bicycles/show', {
        title: req.bicycle.title,
        bicycle: req.bicycle,
        user: req.user
    });
};

exports.destroy = function(req, res) {
    var bicycle = req.bicycle;
    bicycle.remove(function(err) { //TODO ?
        req.flash('info', 'Deleted Successfully');
        res.redirect('/bicycles');
    });
};

exports.order = function(req, res) {
    res.render('bicycles/order', {
        title: '订单确认',
        bicycle: req.bicycle,
        user: req.user
    });
};

exports.createOrder = function(req, res) {
    var cb = function(err) {
        //TODO res.render?
        if (err) {
            console.log('erroo');
            res.render('500');
        }
        console.log('suuu');
        res.redirect('/');
    };
    cb = function(err) {
        if (err) {
            throw err;
        }
    }
    var order = new Order(req.body);
    // order save
    order.seller = req.bicycle.owner;
    order.buyer = req.user;
    order.bicycle = req.bicycle;
    order.save(cb);
    console.log(order);
    // bicycle save
    req.bicycle.orders.push(order._id);
    req.bicycle.save(cb);
    // user save
    req.user.orders.push(order._id);
    req.user.save(cb);
    res.redirect('/');
};
