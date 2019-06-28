import { Sequelize, Model, DataTypes } from 'sequelize'
import { User } from './UserModel'
export class Address extends Model {
  public readonly userId!: number
  public readonly address!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly user?: User
  public static Initialize(sequelize: Sequelize) {
    Address.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        },
        address: {
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
        tableName: 'Address'
      }
    )
  }
}
