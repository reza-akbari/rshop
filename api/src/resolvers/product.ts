import { Product } from "../entities/Product";
import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Order } from "../entities/Order";

@InputType()
class AddProductInput implements Partial<Product> {
  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int)
  stock: number;
}

@Resolver(() => Product)
export class ProductResolver {
  @Query(() => [Product])
  async products() {
    return await Product.find();
  }

  @Mutation(() => Product)
  async addProduct(
    @Arg("data") productData: AddProductInput
  ): Promise<Product> {
    const product = new Product();
    Object.assign(product, productData);
    await product.save();
    return product;
  }

  @FieldResolver(() => [Order])
  async orders (@Root() product: Product) {
    return await product.orders
  }
}
