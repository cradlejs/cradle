import { Sequelize, Model, DataTypes } from 'sequelize'
import { User } from './UserModel'
export class Project extends Model {
  public readonly id!: number
  public readonly ownerId!: number
  public readonly name!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly owner?: User
  public static Initialize(sequelize: Sequelize) {
    Project.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          defaultValue: undefined,
          autoIncrement: true
        },
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        }
      },
      {
        sequelize: sequelize,
        tableName: 'Project'
      }
    )
  }
}
