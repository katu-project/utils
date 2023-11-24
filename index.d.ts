type CloudConfig = {
    SecretId: string
    SecretKey: string
    Region?: string
    Bucket?: string
}
type CloudOptions = {
    config?: CloudConfig
}

declare namespace utils {
    namespace cos {
        function getList<T>(dir:string, options:CloudOptions): Promise<T[]>
        function deleteFile<T>(filepath:string, options:CloudOptions): Promise<T>
        function deleteDir<T>(dir:string, options:CloudOptions): Promise<T>
        function uploadFolder<T>(localFolder:string, remotePrefix:string, options:CloudOptions): Promise<T>
        function uploadFile<T>(localPath:string, remotePath:string, options:CloudOptions): Promise<T>
        function createCompressTask<T>(
            compressDir: string,
            options: {
                config: CloudConfig
                compressConfig: {
                    Flatten?: string
                    Format?: string
                    Type?: string
                    CompressKey?: string
                    UrlList?: string
                    Prefix?: string
                    Key?: string[]
                    IgnoreError?: string
                }
                outputConfig: {
                    Bucket?: string
                    Region?: string
                    Object: string
                }
            }
        ): Promise<T>
    }
    namespace cdn {
        function refreshDirs<T>(name:string[], options?:CloudOptions): Promise<T>
        function getDomainList(options?:CloudOptions): Promise<any>
    }
    namespace scf{
        function getFuncList(options?:{config?:CloudConfig}): Promise<any[]>
        function getFunc(name:string, options?:{config?:CloudConfig}): Promise<any>
        function updateCodeByCos(name:string, cos:{
            name: string
            region: string
            filename: string
        },options?:{config?:CloudConfig})
        function deleteFunc(name:string, options?:{config?:CloudConfig})
        function updateFuncEnv(name:string, env: any[], options?:{config?:CloudConfig})
    }
}

export = utils