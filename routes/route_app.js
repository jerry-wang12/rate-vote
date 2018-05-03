let express = require('express');
let router = express.Router();
let fs = require('fs');
let url = require('url');
let iconv = require('iconv-lite');
let dealFn = require('./dealfn.js');

let database = null;
let maxVoteTimes = 5;

dealFn.readFileData('database.json').then((data) => {
    database = data;
    database.data.total = database.data.objects.length;
}, (msg) => {
    console.log(msg);
})

exports.index = (req, res) => {
    res.render('index');
};

exports.vote = (req, res) => {
    res.render('vote');
};

exports.index_data = (req, res) => {
    let query = url.parse(req.url, true).query,
        id = +query.id,
        queryResult, sendData;
    if (id && database.data.objects.length > 0) {
        database.data.objects.forEach(element => {
            if (element.id == id) {
                queryResult = element;
            }
        });
    }
    sendData = {
        msg: queryResult ? 'success' : 'failed',
        data: queryResult
    };
    res.send(JSON.stringify(sendData));
};

exports.average_rate = (req, res) => {
    let sendData = {
        total: database.data.total,
        averageRate: 0
    };
    if (database.data.objects.length > 0) {
        let sum = 0;
        database.data.objects.forEach(element => {
            sum += +element.rate;
        });
        sendData.averageRate = sum / database.data.objects.length;
    }
    res.send(JSON.stringify(sendData));
};

exports.rate_info = (req, res) => {
    let total = database.data.total,
        rateData = req.body,
        sendData = {
            msg: '评分成功',
            id: rateData.id
        };
    if (null == dealFn.getItem(rateData.id, database.data.objects)) {
        database.data.total++;
        database.data.objects.push(rateData);
        dealFn.writeFileData('database.json', database).then((msg) => {
            console.log(msg);
        }, (msg) => {
            console.log(msg);
        });
    } else {
        sendData.msg = '您已经评价过了,请不要重复评价';
    }
    res.send(JSON.stringify(sendData));
};
