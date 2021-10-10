import { Request, Response } from "express";
import { User, Product, Order } from "./entities";
import { createOrderLoader } from "./utils/createOrderLoader";
import { createProductLoader } from "./utils/createProductLoader";
import { createUserLoader } from "./utils/createUserLoader";
export type ApiContext = {
  req: Request;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  productLoader: ReturnType<typeof createProductLoader>;
  orderLoader: ReturnType<typeof createOrderLoader>;
  [k: any]: any;
};
