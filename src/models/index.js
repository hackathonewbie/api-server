const mongoose = require('mongoose');
const MessageSchema = require('./Message');

mongoose.Promise = global.Promise;

const Models = mongoose.model('Message', MessageSchema);

module.exports = Models;
