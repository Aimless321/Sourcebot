'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('RoleNotifications', 'channel', {
      type: Sequelize.DataTypes.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('RoleNotifications', 'channel');
  }
};
