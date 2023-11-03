// @ts-nocheck
const path = require('path')
const utils = require('../src/index')
const config = require('dotenv').config().parsed
utils.cos.uploadFile(path.join(__dirname,'./index.js'), 'test/index.js', {
    config
})

utils.cos.uploadFolder(path.join(__dirname), 'test/', {
    config
})