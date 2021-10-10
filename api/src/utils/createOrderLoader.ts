import DataLoader from "dataloader";
import { Order } from "../entities/Order";

export const createOrderLoader = () =>
  new DataLoader<number, Order>(
    async (ids: readonly number[]): Promise<Order[]> => {
      const items = await Order.findByIds(ids as number[]);
      const itemsById: Record<number, Order> = {};
      items.forEach((item) => {
        itemsById[item.id] = item;
      });
      return ids.map((id) => itemsById[id]);
    }
  );
