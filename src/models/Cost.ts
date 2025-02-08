import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize, CreationOptional,
} from 'sequelize';

export class Cost extends Model<
    InferAttributes<Cost>,
    InferCreationAttributes<Cost>
> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare amount: number;

    static associate(models: any) {
        // define association here
    }
}

export default function initCost(sequelize: Sequelize) {
    Cost.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: DataTypes.STRING,
            amount: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'Cost',
        },
    );
    return Cost;
}
