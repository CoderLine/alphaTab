"use strict";
module.exports = async function () {
    const callback = this.async();
    return callback(null, "export default 'it works!';");
};
