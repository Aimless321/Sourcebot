'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class VC extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    VC.init({
        id: {
            primaryKey: true,
            type: DataTypes.STRING
        },
        owner: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'VC',
    });
    return VC;
};