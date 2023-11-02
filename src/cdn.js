const tencentcloud = require("tencentcloud-sdk-nodejs");
const CdnClient = tencentcloud.cdn.v20180606.Client;

function getClient(config){
    config = {
        credential: {
            secretId: config.SecretId,
            secretKey: config.SecretKey
        },
        region: "",
        profile: {
            httpProfile: {
                endpoint: "cdn.tencentcloudapi.com",
            },
        }
    };
    if(!config.credential.secretId || !config.credential.secretKey ) throw Error('no SecretID/Key set')
    return new CdnClient(config)
}

exports.refreshDirs = async function(dirs, options){
    const { config={} } = options || {}
    console.log('刷新 CDN 目录:', dirs)
    const client = getClient(config)
    const params = {
        Paths: dirs,
        FlushType: "delete"
    };
    return new Promise((resolve, reject)=>{
        client.PurgePathCache(params).then(
            (data) => {
                resolve(data)
            },
            (err) => {
                reject(err)
            }
        );
    })
}

exports.getTest = async function(options){
    const { config={} } = options || {}
    const client = getClient(config)
    const { RequestId, Domains } = await client.DescribeDomains({})
    if(RequestId && Domains) {
        console.log('test ok')
        console.table(Domains)
    }else{
        console.log('test error')
    }
}