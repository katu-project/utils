type CloudConfig = {
    SecretId: string
    SecretKey: string
    Region?: string
    Bucket?: string
}

declare namespace utils {
    namespace cos {
        function uploadFolder<T>(localFolder:string, remotePrefix:string, options?:{
            config?: CloudConfig
        }): Promise<T>
        function uploadFile<T>(localPath:string, remotePath:string, options?:{
            config?: CloudConfig
        }): Promise<T>
    }
    namespace cdn {
        function refreshDirs<T>(name:string[], options?:{config?:CloudConfig}): Promise<T>

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