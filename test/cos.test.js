// @ts-nocheck
const path = require('path')
const utils = require('uni-utils')
const {cos} = require('../src/index')
const config = require('dotenv').config().parsed
const TestDir = 'test'


;(async ()=>{
    console.log('上传文件')
    await cos.uploadFile(path.join(__dirname,'./index.js'), `${TestDir}/index.js`, {
        config
    })

    console.log('删除文件')
    await cos.deleteFile(`${TestDir}/index.js`, {
        config
    })
    
    console.log('上传文件夹')
    await cos.uploadFolder(path.join(__dirname), `${TestDir}/dir/`, {
        config
    })

    const objects = await cos.getList(`${TestDir}/dir/`, {config})
    console.log('获取文件夹数据:', objects.length === 4)

    console.log('打包文件夹创建压缩文件')
    await cos.createCompressTask(config.CompressDir,{
        config: Object.assign(config,{
            Bucket: config.CompressBucket
        }),
        compressConfig: {
    
        },
        outputConfig: {
            Object: `${TestDir}/test.zip`
        }
    })
    await utils.countdown(10)
    
    console.log('删除文件夹')
    await cos.deleteDir(`${TestDir}/`, {config})
})()