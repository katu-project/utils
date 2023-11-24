## 卡兔项目 utils 库



### 安装
```bash
npm i @katucloud/utils
```

### 加载
```js
const { cdn, cos } = require('@katucloud/utils')
```

### 使用
#### 通用配置
```js
const config = {
    SecretId: '',
    SecretKey: '',
    // cdn
    // cos
    Bucket: '',
    Region: ''
}
```

#### cdn
```js
cdn.refreshDirs

cdn.getDomainList
```

#### cos
```js
cos.getList

cos.uploadFile

cos.uploadFolder

cos.deleteFile

cos.deleteDir

cos.createCompressTask
```