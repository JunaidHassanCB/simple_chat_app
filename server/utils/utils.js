class Utils {
  static getCitrusBitsUtilTemplate(headerValues, bodyValues) {
    const result = `Hello ${headerValues[0]}\nThis is ${bodyValues[1]} on behalf of ${bodyValues[2]}, likes to greet you on your ${bodyValues[3]}\n#Citrusbits #Welcome\nCitrusbits`;
    return result;
  }

  static getTemplate(templateName, headerValues, bodyValues) {
    if (templateName === "citrus_bits_util") {
      return Utils.getCitrusBitsUtilTemplate(headerValues, bodyValues);
    }
  }

  static getConvId(sender_id, receiver_id) {
    const convId = [sender_id, receiver_id].sort().join("-");
    return convId;
  }
}

module.exports = Utils;
