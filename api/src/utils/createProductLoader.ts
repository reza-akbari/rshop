import DataLoader from "dataloader";
import { Product } from "../entities/Product";

export const createProductLoader = () =>
  new DataLoader<number, Product>(
    async (ids: readonly number[]): Promise<Product[]> => {
      const items = await Product.findByIds(ids as number[]);
      const itemsById: Record<number, Product> = {};
      items.forEach((item) => {
        itemsById[item.id] = item;
      });
      return ids.map((id) => itemsById[id]);
    }
  );
