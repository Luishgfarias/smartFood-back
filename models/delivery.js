const mongoose = require('mongoose');

const Entregador = mongoose.model('Entregador', {
  email: String,
  password: String
});

module.exports = Entregador