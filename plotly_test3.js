'use strict';

var plotly = require('plotly')('Lmurta','uxj063ncmv');

var initdata = [{x:[], y:[], stream:{token:'dh8y3kfiqe', maxpoints:200}},
            {x:[], y:[], stream:{token:'kyvbcckjmv', maxpoints:200}}
];
var initlayout = {fileopt : 'overwrite', filename : 'streamSimpleSensor'};

plotly.plot(initdata, initlayout, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);

    var stream1 = plotly.stream('kyvbcckjmv', function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        clearInterval(loop); // once stream is closed, stop writing
    });

    var i = 0;
    var loop = setInterval(function () {


        var data = [{ x : i, y : i * (Math.random() * 10)},
            { x : i, y : i * (Math.random() * 10)
             }];

        var streamObject = JSON.stringify(data);
        stream1.write(streamObject+'\n');
        i++;
    }, 1000);
});