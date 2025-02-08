import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    DataTypes,
    Sequelize, HasManyGetAssociationsMixin,
} from 'sequelize';
import {EventSignup} from "./EventSignup";

export class Event extends Model<
    InferAttributes<Event>,
    InferCreationAttributes<Event>
> {
    declare id: CreationOptional<number>;
    declare channelId: string | null;
    declare messageId: string | null;
    declare name: string;
    declare description: string | null;
    declare eventDate: Date;
    declare attendeeRole: string | null;
    declare mentionRoles: string[];
    declare options: string;

    declare getEventSignups: HasManyGetAssociationsMixin<EventSignup>;

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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.STRING,
            eventDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
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
