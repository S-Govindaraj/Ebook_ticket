const QRCode = require('qrcode');
const generateQRCode = async (ticketInfo) => {
    try {
      return await QRCode.toDataURL(ticketInfo);
    } catch (err) {
      throw new Error("Error generating QR code: " + err.message);
    }
  };

  module.exports = generateQRCode;