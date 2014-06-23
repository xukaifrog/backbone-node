/**
 * Created by kai on 6/21/14.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var mysql = require('mysql');

var allowCrossDomain = function(req, res, next) {
    // if the origin was not passed.
    var origin = (req.headers.origin || "*");

    console.log('origin:' + origin);

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Set-Cookie, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if ("OPTIONS" == req.method) {
        res.send(200);
    } else {
        next();
    }
};
app.use(allowCrossDomain);

var port = 3000;
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'root',
    password        : 'root',
    database        : 'hello'
});

var listUser = function(req, res) {
    var sql = 'select id, firstname, lastname, age from user';
    pool.query(sql, function(err, rows, fields){
        if(err) throw err;
        res.send(rows);
    })
};

var getUser = function(req, res){
    var sql = 'select id, firstname, lastname, age from user where id=' + mysql.escape (req.params.id);
    pool.query(sql, function(err, rows, fields){
        if(err) throw err;
        res.send(rows[0]);
    })
}

var saveUser = function(req, res){
    var sql = 'update user set firstname=?, lastname=?, age=? where id=?';
    var body = req.body;
    var update = [body.firstname, body.lastname, body.age, body.id];
    sql = mysql.format(sql, update);

    pool.query(sql);
    res.send(true);
}

app.get('/users', listUser);
app.get('/users/:id', getUser);
app.put('/users/:id', saveUser);

app.listen(port);