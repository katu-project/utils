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