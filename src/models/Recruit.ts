import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize, CreationOptional,
} from 'sequelize';

export class Recruit extends Model<
    InferAttributes<Recruit>,
    InferCreationAttributes<Recruit>
> {
    declare id: CreationOptional<number>;
    declare discordId: string;
    declare guildId: string | null;
    declare periodStart: Date;
    declare periodEnd: Date;
    declare notificationSent: boolean;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initRecruit(sequelize: Sequelize) {
    Recruit.init(
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
            guildId: DataTypes.STRING,
            periodStart: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            periodEnd: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            notificationSent: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Recruit',
        },
    );
    return Recruit;
}
