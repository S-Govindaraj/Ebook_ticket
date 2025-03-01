const crypto = require("crypto-js");
const config = require("config");

const RequestDecrypt = (req, res, next) => {
  const password = config.endepwd;
  const isMethod = ["POST", "PUT"];
  if (
    req.path.includes("/api") && req.path !== "/api/encrypt" &&
    String(req.headers["content-type"]).indexOf("multipart/form-data") === -1
  ) {
    if (!req.body.request_data && isMethod.includes(req.method) )
      return res.status(401).json({ message: "Invalid Request" });

    if (isMethod.includes(req.method)) {
      const result = crypto.AES.decrypt(req.body.request_data, password);
      req.body = JSON.parse(result.toString(crypto.enc.Utf8));
    }
  }
  next();
};

module.exports = { RequestDecrypt };
