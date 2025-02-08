import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class VC extends Model<
    InferAttributes<VC>,
    InferCreationAttributes<VC>
> {
    declare id: string;

    // Adjust the type if 'owner' can be null:
    declare owner: string;

    static associate(models: any) {
        // define associations here if needed
    }
}

export default function initVC(sequelize: Sequelize) {
    VC.init(
        {
            id: {
                primaryKey: true,
                type: DataTypes.STRING,
            },
            owner: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'VC',
        },
    );
    return VC;
}
