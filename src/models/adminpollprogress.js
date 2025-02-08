'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminPollProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AdminPollProgress.init({
    discordId: {
      type: DataTypes.STRING,
      unique: true
    },
    progress: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'AdminPollProgress',
  });
  return AdminPollProgress;
};