import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class EventSignup extends Model<
    InferAttributes<EventSignup>,
    InferCreationAttributes<EventSignup>
> {
    declare eventId: number;
    declare discordId: string;
    declare type: string | null;

    static associate(models: any) {
        EventSignup.belongsTo(models.Event);
    }
}

export default function initEventSignup(sequelize: Sequelize) {
    EventSignup.init(
        {
            eventId: {
                type: DataTypes.INTEGER,
                unique: 'unique_signup',
            },
            discordId: {
                type: DataTypes.STRING,
                unique: 'unique_signup',
            },
            type: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'EventSignup',
        },
    );
    return EventSignup;
}
