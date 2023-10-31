const tencentcloud = require("tencentcloud-sdk-nodejs");
const CdnClient = tencentcloud.cdn.v20180606.Client;
const clientConfig = {
    credential: {
        secretId: process.env['SecretId'],
        secretKey: process.env['SecretKey'],
    },
    region: "",
    profile: {
        httpProfile: {
            endpoint: "cdn.tencentcloudapi.com",
        },
    },
};

const client = new CdnClient(clientConfig);

exports.refreshDirs = function(dirs){
    console.log('刷新 CDN 目录:', dirs)
    const params = {
        Paths: dirs,
        FlushType: "delete"
    };
    client.PurgePathCache(params).then(
        (data) => {
            console.log(data);
        },
        (err) => {
            console.error("error", err);
        }
    );
}

exports.getTest = async function(){
    const {RequestId, DomainList } = await client.ListScdnDomains()
    if(RequestId && DomainList?.length === 0) {
        console.log('test ok')
    }else{
        console.log('test error')
    }
}