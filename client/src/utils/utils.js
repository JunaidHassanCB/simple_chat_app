class Utils {
  static getConvId(sender_id, receiver_id) {
    const convId = [sender_id, receiver_id].sort().join("-");
    return convId;
  }
}

module.exports = Utils;
