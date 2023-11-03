// @ts-nocheck
const path = require('path')
const utils = require('../index')
const config = require('dotenv').config().parsed
utils.cos.uploadFile('./index.js', 'test/index.js', {
    config
})

utils.cos.uploadFolder(path.join(__dirname), 'test/', {
    config
})