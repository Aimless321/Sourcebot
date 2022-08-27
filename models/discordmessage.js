'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DiscordMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DiscordMessage.init({
    tag: {
      type:DataTypes.STRING,
      unique: true
    },
    channelId: DataTypes.STRING,
    messageId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DiscordMessage',
  });
  return DiscordMessage;
};