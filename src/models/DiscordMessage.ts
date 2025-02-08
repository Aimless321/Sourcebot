import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class DiscordMessage extends Model<
    InferAttributes<DiscordMessage>,
    InferCreationAttributes<DiscordMessage>
> {
    declare tag: string;
    declare channelId: string | null;
    declare messageId: string | null;

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initDiscordMessage(sequelize: Sequelize) {
    DiscordMessage.init(
        {
            tag: {
                type: DataTypes.STRING,
                unique: true,
            },
            channelId: DataTypes.STRING,
            messageId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'DiscordMessage',
        },
    );
    return DiscordMessage;
}
