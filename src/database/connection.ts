import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";

export const db = new Sequelize({
  database: "poly_trading_bot",
  username: "POLY_ADMIN",
  password: "POLY123@",
  host: "localhost",
  port: 3306,
  dialect: "mariadb",
  logging: (msg) => logger.info(msg),
});
