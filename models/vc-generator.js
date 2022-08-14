'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class VCGenerator extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    VCGenerator.init({
        id: {
            primaryKey: true,
            type: DataTypes.STRING
        },
        parentId: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'VCGenerator',
    });
    return VCGenerator;
};