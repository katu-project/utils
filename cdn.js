const tencentcloud = require("tencentcloud-sdk-nodejs");

function getClient(config){
    const CdnClient = tencentcloud.cdn.v20180606.Client;
    const clientConfig = {
        credential: {
            secretId: process.env['SecretId'],
            secretKey: process.env['SecretKey'],
            ...config
        },
        region: "",
        profile: {
            httpProfile: {
                endpoint: "cdn.tencentcloudapi.com",
            },
        },
    };

    const client = new CdnClient(clientConfig);
    client['config'] = config
    return client
}

exports.refreshDirs = function(dirs, {config}){
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

exports.getTest = async function(){
    const client = getClient()
    const { RequestId, Domains } = await client.DescribeDomains({})
    if(RequestId && Domains) {
        console.log('test ok')
        console.table(Domains)
    }else{
        console.log('test error')
    }
}