var plotly = require('plotly')("Lmurta", "uxj063ncmv")

var data = [{x:[0,1,2], y:[3,2,1], type: 'bar'}];
var layout = {fileopt : "extend", filename : "plotly_test"};

plotly.plot(data, layout, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);
});