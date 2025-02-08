import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class Recruit extends Model<
    InferAttributes<Recruit>,
    InferCreationAttributes<Recruit>
> {
    declare discordId: string;
    declare guildId: string | null;
    declare periodStart: Date | null;
    declare periodEnd: Date | null;
    declare notificationSent: boolean;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initRecruit(sequelize: Sequelize) {
    Recruit.init(
        {
            discordId: {
                type: DataTypes.STRING,
                unique: true,
            },
            guildId: DataTypes.STRING,
            periodStart: DataTypes.DATE,
            periodEnd: DataTypes.DATE,
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
