'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoleNotification.init({
    role: {
      type: DataTypes.STRING,
      unique: true
    },
    message: DataTypes.STRING,
    channel: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'RoleNotification',
  });
  return RoleNotification;
};