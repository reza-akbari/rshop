import { readFileSync } from "fs";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { ProductResolver } from "./resolvers/product";
import { createUserLoader } from "./utils/createUserLoader";
import { createProductLoader } from "./utils/createProductLoader";
import { createOrderLoader } from "./utils/createOrderLoader";
import { ApiContext } from "./types";
import { User } from "./entities/User";
import { Product } from "./entities/Product";
import { Order } from "./entities/Order";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "postgres",
    username: readFileSync("/run/secrets/postgres_usr", "utf8"),
    database: readFileSync("/run/secrets/postgres_db", "utf8"),
    password: readFileSync("/run/secrets/postgres_pass", "utf8"),
    entities: [User, Product, Order],
    synchronize: true,
    // logging: true
  });

  const app = express();

  const httpServer = createServer(app);
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [ProductResolver],
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
    context({ req, res }) {
      const ctx: ApiContext = {
        req,
        res,
        userLoader: createUserLoader(),
        productLoader: createProductLoader(),
        orderLoader: createOrderLoader(),
      };
      return ctx;
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: "/api" });

  app.set("trust proxy", 1);

  const port = process.env.EXPOSED_PORT;
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));
  console.log(`http server running at ${port}`);
};

main().catch(console.error);
