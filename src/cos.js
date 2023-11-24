const util = require('./utils');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

function getClient(config){
    config = {
        // 必选参数
        SecretId: config.SecretId,
        SecretKey: config.SecretKey,
        // 可选参数
        FileParallelLimit: 3, // 控制文件上传并发数
        ChunkParallelLimit: 8, // 控制单个文件下分片上传并发数，在同园区上传可以设置较大的并发数
        ChunkSize: 1024 * 1024 * 8, // 控制分片大小，单位 B，在同园区上传可以设置较大的分片大小
        Proxy: '',
        Protocol: 'https:',
        FollowRedirect: false,
    }
    if(!config.SecretId || !config.SecretKey ) throw Error('no SecretID/Key set')
    return new COS(config)
}

async function getList(dir, options){
    const { config={} } = options || {}
    const client = getClient(config)
    return client.getBucket({
        Bucket: config.Bucket,
        Region: config.Region,
        Prefix: dir
    }).then(e=>e.Contents)
}
exports.getList = getList

exports.uploadFile = async function(localPath, remotePath, options) {
    const { config={} } = options || {}
    const client = getClient(config)
    return client.uploadFile({
        Bucket: config.Bucket,
        Region: config.Region,
        FilePath: localPath,
        Key: remotePath,
        onFileFinish: function (err, _, options) {
            console.log(options.Key + ' 上传' + (err ? '失败' : '完成'));
        }
    })
}

exports.uploadFolder = async function (localFolder, remotePrefix, options) {
    const { config={} } = options || {}
    const client = getClient(config)
    return new Promise((resolve, reject)=>{
        util.fastListFolder(localFolder, function (err, list) {
            if (err) return console.error(err);
            let files = list.map(function (file) {
                let filename = path.relative(localFolder, file.path).replace(/\\/g, '/');
                if (filename && file.isDir && !filename.endsWith('/')) filename += '/';
                const fileKey = remotePrefix + filename;
                return {
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: fileKey,
                    FilePath: file.path,
                };
            }).filter(e => !e.FilePath.endsWith('.DS_Store') && !e.FilePath.endsWith('/'))
            //console.log(files.slice(0,5))
    
            client.uploadFiles(
                {
                    files: files,
                    SliceSize: 1024 * 1024,
                    onFileFinish: function (err, data, options) {
                        console.log(options.Key + ' 上传' + (err ? '失败:' + options.FilePath : '完成'));
                    },
                },
                function (err, data) {
                    // console.log(err || data);
                    if(err){
                        return reject(err)
                    }
                    resolve(data)
                },
            );
        });
    })
}

exports.createCompressTask = async function(packDir, options){
    const { config={}, compressConfig={}, outputConfig={} } = options || {}
    const client = getClient(config)

    if(!outputConfig.Object) throw Error('没有指定输出对象')
    const host = config.Bucket + '.ci.' + config.Region + '.myqcloud.com/file_jobs';
    const url = 'https://' + host;
    const body = COS.util.json2xml({
        Request: {
            Tag: 'FileCompress', // 必须
            Operation: {
                FileCompressConfig: {
                    Flatten: '0', // 文件打包时，是否需要去除源文件已有的目录结构.0:不需要;1:需要
                    Format: 'zip', // 打包压缩的类型，有效值：zip、tar、tar.gz
                    Type: 'default',
                    CompressKey: '',
                    // UrlList、Prefix、Key 三者仅能选择一个，不能都为空，也不会同时生效
                    // UrlList: '', // 索引文件的对象地址
                    Prefix: packDir.endsWith('/')? packDir : packDir+'/', // 目录前缀
                    Key: [''], // 支持对存储桶中的多个文件进行打包，个数不能超过 1000, 总大小不超过50G，否则会导致任务失败
                    IgnoreError: 'false',
                    ...compressConfig
                },
                Output: {
                    Bucket: config.Bucket, // 保存压缩后文件的存储桶
                    Region: config.Region, // 保存压缩后文件的存储桶地域
                    Object: '', // 压缩后文件的文件名
                    ...outputConfig
                },
                UserData: '',
            },
            // QueueId: '', // 任务所在的队列 ID
            // CallBack: 'http://callback.demo.com', // 任务回调的地址
            // CallBackFormat: 'JSON', // 任务回调格式
            // CallBackType: 'Url', // 任务回调类型，Url 或 TDMQ，默认 Url
        },
    });
    return client.request({
        Method: 'POST',
        Key: 'file_jobs',
        Url: url,
        Body: body,
        ContentType: 'application/xml',
    }).then(e=>e.Response)
}

exports.deleteFile = async function(filepath, options){
    const { config={} } = options || {}
    const client = getClient(config)
    return client.deleteObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: filepath
    })
}

exports.deleteDir = async function(dir, options){
    const { config={} } = options || {}
    const client = getClient(config)
    const list = await getList(dir, options)
    const objects = list.map(function (item) {
        return {Key: item.Key}
    })
    if(!objects.length) return
    return client.deleteMultipleObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Objects: objects
    })
}