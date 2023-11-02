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

    }
    namespace cdn {
        function refreshDirs<T>(name:string[], options?:{config?:CloudConfig}):  Promise<T>

    }
    namespace scf{

    }
}

export = utils