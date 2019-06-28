import { Sequelize, Model, DataTypes } from 'sequelize'
import { Address } from './AddressModel'
export class User extends Model {
  public readonly id!: number
  public readonly name!: string
  public readonly preferredName!: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly projects!: IProject[]
  public readonly address?: Address
  public static Initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          defaultValue: undefined,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: false,
          primaryKey: false,
          defaultValue: undefined,
          autoIncrement: false
        },
        preferredName: {
          type: DataTypes.STRING(128),
          allowNull: true,
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
        tableName: 'User'
      }
    )
  }
}
