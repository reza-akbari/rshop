import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order";

@ObjectType()
@Entity()
export class Product extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 150 })
  name: string;

  @Field()
  @Index({ unique: true })
  @Column({ length: 200 })
  slug: string;

  @Field()
  @Column({ length: 400 })
  description: string;

  // @Field()
  // @Column({ type: "text" })
  // details: string;

  // @Field()
  // @Column({ length: 200 })
  // image: string;

  @Field(() => Int)
  @Column({ type: "bigint" })
  price: number;

  @Field()
  @Index()
  @Column({ type: "boolean" })
  // TODO: I dont expect this to be set from outside, how do I specify that?
  inStock: boolean;

  @Field(() => Int)
  @Column({ type: "int" })
  stock: number;

  @Field(() => Date)
  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Order])
  @ManyToMany(() => Order, (order) => order.products)
  @JoinTable()
  orders: Promise<Order[]>;

  @BeforeInsert()
  @BeforeUpdate()
  syncInStock() {
    this.inStock = this.stock > 0;
  }

  @BeforeInsert()
  @BeforeUpdate()
  forceSlug() {
    if (!this.slug) {
      this.slug = `${this.name}`.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    }
  }
}
