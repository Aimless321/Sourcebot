import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class CostOverview extends Model<
    InferAttributes<CostOverview>,
    InferCreationAttributes<CostOverview>
> {
    declare guildId: string;
    declare channelId: string;
    declare messageId: string;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initCostOverview(sequelize: Sequelize) {
    CostOverview.init(
        {
            guildId: DataTypes.STRING,
            channelId: DataTypes.STRING,
            messageId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'CostOverview',
        },
    );

    return CostOverview;
}
