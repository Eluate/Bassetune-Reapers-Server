var toMysqlFormat = function (date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

module.exports.toMysqlFormat = toMysqlFormat;

//example call
//new Date(1999,12,30).toMysqlFormat()