import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class Cost extends Model<
    InferAttributes<Cost>,
    InferCreationAttributes<Cost>
> {
    declare title: string;
    declare amount: number;

    static associate(models: any) {
        // define association here
    }
}

export default function initCost(sequelize: Sequelize) {
    Cost.init(
        {
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
