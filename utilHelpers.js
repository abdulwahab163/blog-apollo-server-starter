const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const getToken = async (user, secret, expiresIn) => {
  const { _id } = user;
  return await jwt.sign({ _id }, secret, { expiresIn });
};
const decodeToken = async (token, secret) => {
  return await jwt.verify(token, secret);
};
const getHashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
};
const comparePassword = async (password, hash) => {
  const isCorrectPassword = await bcrypt.compare(password, hash);
  return isCorrectPassword;
};
module.exports = {
  getToken,
  decodeToken,
  getHashPassword,
  comparePassword,
};
