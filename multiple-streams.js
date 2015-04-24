'use strict';

var STREAM_TOKEN_0 = 'i4syfw4mxj';
var STREAM_TOKEN_1 = 'o07wtgg9lj';
var STREAM_TOKEN_2 = 'f9xh13dg2b';
var STREAM_TOKEN_3 = 'dh8y3kfiqe';
var STREAM_TOKEN_4 = 'kyvbcckjmv';
var STREAM_TOKEN_5 = 've9yeeet4k';
var MAX_POINTS = 1000;

var plotly = require('plotly')('Lmurta','uxj063ncmv');

// plotly init data
var initData = [
		 {x: [],y: [],name:"A0",stream:{token: STREAM_TOKEN_0,maxpoints: MAX_POINTS}}
    	,{x: [],y: [],name:"A1",,stream:{token: STREAM_TOKEN_1,maxpoints: MAX_POINTS}}
    	,{x: [],y: [],name:"A2",,stream:{token: STREAM_TOKEN_2,maxpoints: MAX_POINTS}}
    	,{x: [],y: [],name:"A3",,stream:{token: STREAM_TOKEN_3,maxpoints: MAX_POINTS}}
    	,{x: [],y: [],name:"A4",,stream:{token: STREAM_TOKEN_4,maxpoints: MAX_POINTS}}
    	,{x: [],y: [],name:"A5",,stream:{token: STREAM_TOKEN_5,maxpoints: MAX_POINTS}}
];

var initLayout = {
    fileopt: 'overwrite',
    filename: 'streamSimpleSensor'
    ,showlegend: true,
};

plotly.plot(initData, initLayout, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);

    var stream1 = plotly.stream(STREAM_TOKEN_0, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        clearInterval(loop); // once stream is closed, stop writing
    });

    var stream2 = plotly.stream(STREAM_TOKEN_1, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        clearInterval(loop); // once stream is closed, stop writing
    });

    var i = 0;
    var loop = setInterval(function () {

        var data1 = { x : i, y : i * (Math.random() * 10) };
        var streamObject1 = JSON.stringify(data1);

        var data2 = { x : i, y : i * (Math.random() * 10) };
        var streamObject2 = JSON.stringify(data2);

        stream1.write(streamObject1+'\n');
        stream2.write(streamObject2+'\n');
        i++;

    }, 1000);
});
