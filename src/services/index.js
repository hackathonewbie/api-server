const Chlor_a = require('./Chlor_a');

module.exports = function (app) {
  app.use('chlor_a', new Chlor_a());
};
