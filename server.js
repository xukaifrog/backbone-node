/**
 * Created by kai on 6/21/14.
 */
var express = require('express');
var app = express();
var mysql = require('mysql');


var port = 3000;
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'root',
    password        : 'root',
    database        : 'hello'
});

app.all('*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Content-Type", "application/json");
    next();
});

var listUser = function(req, res) {
    var sql = 'select id, firstname, lastname, age from user';
    pool.query(sql, function(err, rows, fields){
        if(err) throw err;
        res.send(rows);
    })
};

var getUser = function(req, res){
    var sql = 'select id, firstname, lastname, age from user where id=' + mysql.escape (res.params.id);
    pool.query(sql, function(err, rows, fields){
        if(err) throw err;
        res.send(rows);
    })

}

app.get('/users', listUser);
app.get('/users/:id', getUser);

app.listen(port);