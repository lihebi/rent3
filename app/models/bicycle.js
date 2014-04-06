/**
 * @file models/bicycle.js
 *
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , utils = require('../../lib/utils')
    , helpers = require('../../config/helpers')
    ;

var BicycleSchema = new Schema({
    name: {type: String, default: ''},
    owner: { type: Schema.ObjectId, ref: 'User'},
    //TODO select from brands
    brand: { type: String, default: ''},
    desc: {type: String, default: '', trim: true},
    /*
    orders: [{
        user: {type: Schema.ObjectId, ref: 'User'},
        from: {type: String, default: helpers.yyyymmdd()},
        to: {type: String, default: helpers.yyyymmdd1()},
        createdAt: {type: Date, default: Date.now}
    }],
    */
    orders: [{
        type: Schema.ObjectId, ref: 'Order'
    }],
    customers: [{ type: Schema.ObjectId, ref: 'User'}],
    image: {
        url: String
    },
    createdAt: { type: Date, default: Date.now}
});

BicycleSchema.methods = {
    moveAndSave: function(image, cb) {
        var self = this;
        utils.moveImage(image, 'public/img/upload/', function(newFile) {
            utils.thumbnailImage(newFile, 'public/img/thumbnail/', function(url) {
                self.image.url = url.substr(6);
                self.save(cb);
            });
        });
    }
                 /*
    addOrder: function(user, order, cb) {
        this.orders.push({
            user: user,
            from: order.from,
            to: order.to
        });
        this.save(cb);
    }
    */
};
//TODO 找时间整理一下
BicycleSchema.statics = {
    load: function(id, cb) {
        var User = mongoose.model('User');
        var Order = mongoose.model('Order');
        var Bicycle = mongoose.model('Bicycle');
        this.findOne({_id: id})
            // lean is not necessary, but without it, the print of docs show orders.buy is [object] other than plain text
            //.lean()
            .populate('owner')
            .populate('orders')
            .exec(function(err, docs) {
                if (err) console.log(err);
                // must be this. and docs is the result, docs2 is only part of it. this will modify docs automatically
                // instead of path: 'orders.seller'
                // instead of (docs, 'orders.seller')
                /*
                var opts = [{path: 'seller'}];
                User.populate(docs.orders, opts, function(err, docs2) {
                    console.log(docs);
                    console.log(docs2);
                });
                */
                User.populate(docs.orders, 'seller buyer', function(err, docs2) {
                    // here in, the docs is populated
                    cb(err, docs);
                });
                // here out, the docs is not populated
                /*docs.populate('orders.buyer').exec(function(err, docs2) {
                    console.log(docs2);
                });
                */
            });
            //.exec(cb);
    },
    list: function(options, cb) {
        var criteria = options.criteria || {};
        this.find(criteria)
            .populate('owner')
            .sort({'createdAt': -1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb);
    }
};

mongoose.model('Bicycle', BicycleSchema);
