'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('VCGenerators', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING
            },
            parentId: {
                allowNull: false,
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('VC-Generators');
    }
};