'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventSignup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EventSignup.belongsTo(models.Event);
    }
  }
  EventSignup.init({
    eventId: {
      type: DataTypes.INTEGER,
      unique: 'unique_signup'
    },
    discordId: {
      type: DataTypes.STRING,
      unique: 'unique_signup'
    },
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EventSignup',
  });
  return EventSignup;
};