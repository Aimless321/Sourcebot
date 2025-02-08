import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class Contribution extends Model<
    InferAttributes<Contribution>,
    InferCreationAttributes<Contribution>
> {
    declare discordId: string;
    declare amount: number;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initContribution(sequelize: Sequelize) {
    Contribution.init(
        {
            discordId: {
                type: DataTypes.STRING,
                unique: true,
            },
            amount: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'Contribution',
        },
    );
    return Contribution;
}
