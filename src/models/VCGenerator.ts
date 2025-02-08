import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    Sequelize,
} from 'sequelize';

export class VCGenerator extends Model<
    InferAttributes<VCGenerator>,
    InferCreationAttributes<VCGenerator>
> {
    // We mark 'id' as required since it's the primary key
    declare id: string;
    declare parentId: string | null; // If parentId can be null, adjust accordingly
    declare name: string | null;     // Same if name can be null

    static associate(models: any) {
        // define association here if needed
    }
}

export default function initVCGenerator(sequelize: Sequelize) {
    VCGenerator.init(
        {
            id: {
                primaryKey: true,
                type: DataTypes.STRING,
            },
            parentId: DataTypes.STRING,
            name: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'VCGenerator',
        },
    );
    return VCGenerator;
}
