const mongoose = require('mongoose');

const estabelecimento = mongoose.model('estabelecimento', {
  name: String,
  email: String,
  password: String,
  establishment: String,
  image: String,
  address: Object
});

module.exports = estabelecimento