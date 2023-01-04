'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recruit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Recruit.init({
    discordId: {
      type: DataTypes.STRING,
      unique: true,
    },
    guildId: DataTypes.STRING,
    periodStart: DataTypes.DATE,
    periodEnd: DataTypes.DATE,
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Recruit',
  });
  return Recruit;
};