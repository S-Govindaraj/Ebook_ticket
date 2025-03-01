const crypto = require("crypto-js");
const axios = require("axios");
const config = require("config");
const password = config.endepwd;

// Encrypt data
exports.encrypt = (req, res) => {
  const result = crypto.AES.encrypt(JSON.stringify(req.body), password);
  res.send(result.toString());
};

// Decrypt data
exports.decrypt = (req, res) => {
  const result = crypto.AES.decrypt(req.body.request_data, password);
  const data = JSON.parse(result.toString(crypto.enc.Utf8));
  res.send(data);
};