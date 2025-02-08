import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
} from 'sequelize';

export class RoleNotification extends Model<
    InferAttributes<RoleNotification>,
    InferCreationAttributes<RoleNotification>
> {
  declare role: string;
  declare message: string;
  declare channel: string;

  static associate(models: any) {
    // define association here if needed
  }
}

export default function initRoleNotification(sequelize: Sequelize) {
  RoleNotification.init(
      {
        role: {
          type: DataTypes.STRING,
          unique: true,
        },
        message: DataTypes.STRING,
        channel: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: 'RoleNotification',
      },
  );
  return RoleNotification;
}
