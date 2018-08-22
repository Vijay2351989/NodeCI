const {clearHash} = require('../services/cache');

// exports.clearCache = async (req,res,next) => {
//   await next();
//   clearHash(req.user.id);
// };

clearCache = async (req,res,next) => {
  await next();
  clearHash(req.user.id);
};

module.exports = clearCache
