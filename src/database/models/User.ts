import { DataTypes, Model } from "sequelize";
import { db } from "../connection";

class User extends Model {
  declare id: number;
  declare telegramId: string;
  declare ethPrivateKey: string;
  declare ethAddress: string;
  declare solPrivateKey: string;
  declare solAddress: string;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    telegramId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ethPrivateKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ethAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    solPrivateKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    solAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    availableTradingBalance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    tableName: "users",
    timestamps: true,
  }
);

export { User };
