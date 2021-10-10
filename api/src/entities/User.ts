import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  email: string;

  @Column({ length: 100, nullable: true })
  name?: string;

  // @Column({ length: 200, nullable: true })
  // avatar?: string;

  @Column({ type: "bigint" })
  credit: number;

  @Column({ length: 200 })
  password: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
