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

utils.cos.createCompressTask(config.CompressDir,{
    config: Object.assign(config,{
        Bucket: config.CompressBucket
    }),
    compressConfig: {

    },
    outputConfig: {
        Object: '_test/test.zip'
    }
}).then(console.log)