'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.hasMany(models.EventSignup, {onDelete: 'CASCADE'});
    }
  }
  Event.init({
    channelId: DataTypes.STRING,
    messageId: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    eventDate: DataTypes.DATE,
    attendeeRole: DataTypes.STRING,
    mentionRoles: DataTypes.JSON,
    options: {
      type: DataTypes.STRING,
      defaultValue: 'signup_generic'
    },
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};