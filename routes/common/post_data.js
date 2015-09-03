var express = require('express');
var router = express.Router();
var query = require('querystring');
var formidable = require('formidable');

router.use(function(req, res, next){
    if(req.method == 'POST'){
        if(req.url.indexOf('?') === -1){
            req.url += "?";
        }
        //for firefox 
        if(req.get('Content-Type') && req.get('Content-Type').indexOf('application/x-www-form-urlencoded') > -1){
            for(var szQ in req.body){
                req.url += "&" + szQ + "=" + encodeURIComponent(req.body[szQ]);
            }
            next();
        }else{
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files){
                for(var name in fields){
                    req.url += "&" + name + "=" + encodeURIComponent(fields[name]);
                }
                res.locals.files=files;
                next();
            });
        }
    }else{
        next();
    }
});

module.exports = router;
