import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

import { products } from "../lib/data/db.json"
import { envs } from "@/core/config/envs";

const connectionString = `${envs.POSTGRES_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });



async function main() {

  await prisma.product.deleteMany()

  for (const product of products) {

    await prisma.product.create({
      data: {
        id: Number(product.id),
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        image: product.image,
        additionalImages: product.additionalImages ?? [],
        category: product.category,
        rating: product.rating,
        reviews: product.reviews,
        stock: product.stock ?? 0,
        inStock: product.inStock,
        specs: product.specs
      }
    })

  }

  console.log('Productos insertados')
}

main()