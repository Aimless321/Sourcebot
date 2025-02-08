import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize, CreationOptional,
} from 'sequelize';

export class Contribution extends Model<
    InferAttributes<Contribution>,
    InferCreationAttributes<Contribution>
> {
    declare id: CreationOptional<number>;
    declare discordId: string;
    declare amount: number;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initContribution(sequelize: Sequelize) {
    Contribution.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
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
