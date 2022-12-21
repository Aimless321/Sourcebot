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
      models.Event.hasMany(EventSignup, {
        foreignKey: 'eventId'
      })
    }
  }
  EventSignup.init({
    eventId: DataTypes.INTEGER,
    discordId: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EventSignup',
  });
  return EventSignup;
};