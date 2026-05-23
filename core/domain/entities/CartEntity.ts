
export class CartItemEntity {
  constructor(
    public id: string,
    public productId: string,
    public quantity: number,
  ) {}
}

export class CartEntity {
  constructor(
    public id: string,
    public userId: string,
    public items: CartItemEntity[]
  ) {}
}