const fs = require('fs')

const getFiles = (dir, extention) => {
    return fs.readdirSync(dir).filter(file => file.endsWith(extention))
}
module.exports = {
    getFiles
}