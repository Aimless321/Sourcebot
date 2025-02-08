import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class Event extends Model<
    InferAttributes<Event>,
    InferCreationAttributes<Event>
> {
    declare id: CreationOptional<number>;
    declare channelId: string | null;
    declare messageId: string | null;
    declare name: string | null;
    declare description: string | null;
    declare eventDate: Date | null;
    declare attendeeRole: string | null;
    declare mentionRoles: any;
    declare options: string;

    static associate(models: any) {
        Event.hasMany(models.EventSignup, {onDelete: 'CASCADE'});
    }
}

export default function initEvent(sequelize: Sequelize) {
    Event.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            channelId: DataTypes.STRING,
            messageId: DataTypes.STRING,
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            eventDate: DataTypes.DATE,
            attendeeRole: DataTypes.STRING,
            mentionRoles: DataTypes.JSON,
            options: {
                type: DataTypes.STRING,
                defaultValue: 'signup_generic',
            },
        },
        {
            sequelize,
            modelName: 'Event',
        },
    );
    return Event;
}
