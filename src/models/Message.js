const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
});

module.exports = Schema;
