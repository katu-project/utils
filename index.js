let config = require('dotenv').config().parsed
const cdn = require('./cdn')
const cos = require('./cos')
const csf = require('./csf')

const actions = {
    cdn,
    cos,
    csf
}

exports.getAction = function(name, configPath){
    if(configPath){
        config = require('dotenv').config({
            path: configPath
        }).parsed
    }
    if(!config.SecretId) {
        console.log('配置参数错误')
        return
    }
    return actions[name]
}