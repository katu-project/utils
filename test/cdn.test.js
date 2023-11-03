// @ts-nocheck
const utils = require('../src/index')
const config = require('dotenv').config().parsed
utils.cdn.getDomainList({
    config
}).then(console.table)