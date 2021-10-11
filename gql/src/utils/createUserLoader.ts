import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(
    async (ids: readonly number[]): Promise<User[]> => {
      const items = await User.findByIds(ids as number[]);
      const itemsById: Record<number, User> = {};
      items.forEach((item) => {
        itemsById[item.id] = item;
      });
      return ids.map((id) => itemsById[id]);
    }
  );
