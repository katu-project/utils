const Batch = require('batch');
const fs = require('fs');

function fastListFolder(options, callback) {
    const pathJoin = function(dir, name, isDir) {
        dir = dir.replace(/\\/g, '/');
        const sep = dir.endsWith('/') ? '' : '/';
        let p = dir + sep + name;
        p = p.replace(/\\/g, '/');
        isDir && name && (p += '/');
        return p;
    };

    const readdir = function stat(dir, cb) {
        if (!dir || !cb) throw new Error('stat(dir, cb[, concurrency])');
        fs.readdir(dir, function(err, files) {
            if (err) return cb(err);
            const batch = new Batch();
            batch.concurrency(16);
            files.forEach(function(file) {
                const filePath = pathJoin(dir, file);
                batch.push(function(done) {
                    fs.stat(filePath, done);
                });
            });
            batch.end(function(err, stats) {
                if (err) {
                    console.log('readdir error:', err);
                    cb(err);
                    return;
                }
                stats.forEach(function(stat, i) {
                    stat.isDir = stat.isDirectory();
                    stat.path = pathJoin(dir, files[i], stat.isDir);
                    stat.isDir && (stat.size = 0);
                });
                cb(err, stats);
            });
        });
    };

    const statFormat = function(stat) {
        return {
            path: stat.path,
            size: stat.size,
            isDir: stat.isDir
        };
    };

    if (typeof options !== 'object') options = { path: options };
    const rootPath = options.path;
    let list = [];
    const _callback = function(err) {
        if (err) {
            callback(err);
        } else if (list.length > 1000000) {
            callback(window.lang.t('error.too_much_files'));
        } else {
            callback(null, list);
        }
    };
    const deep = function(dirStat, deepNext) {
        list.push(statFormat(dirStat));
        readdir(dirStat.path, function(err, files) {
            if (err) return deepNext();
            const dirList = files.filter(file => file.isDir);
            const fileList = files.filter(file => !file.isDir);
            list = [].concat(list, fileList.map(statFormat));
            eachLimit(dirList, 1, deep, deepNext);
        });
    };
    fs.stat(rootPath, function(err, stat) {
        if (err) return _callback();
        stat.isDir = true;
        stat.path = pathJoin(rootPath, '', true);
        stat.isDir && (stat.size = 0);
        deep(stat, _callback);
    });
};

var eachLimit = function (arr, limit, iterator, callback) {
    callback = callback || function () {};
    if (!arr.length || limit <= 0) {
      return callback();
    }
  
    var completed = 0;
    var started = 0;
    var running = 0;
  
    (function replenish() {
      if (completed >= arr.length) {
        return callback();
      }
  
      while (running < limit && started < arr.length) {
        started += 1;
        running += 1;
        iterator(arr[started - 1], function (err) {
          if (err) {
            callback(err);
            callback = function () {};
          } else {
            completed += 1;
            running -= 1;
            if (completed >= arr.length) {
              callback();
            } else {
              replenish();
            }
          }
        });
      }
    })();
};

module.exports = {
    fastListFolder
}