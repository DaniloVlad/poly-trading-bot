import { DataTypes, Model } from "sequelize";
import { db } from "../connection";

class UserOrder extends Model {
  declare id: number;
  declare userId: number;
  declare orderId: string;
}

UserOrder.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "user_orders",
    timestamps: true,
  }
);

export { UserOrder };
