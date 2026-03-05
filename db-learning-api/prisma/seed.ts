/**
 * サンプルデータ投入（ユーザ、投稿、コメント、フォロー、いいね）
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // ユーザ作成
  const users = await Promise.all([
    prisma.user.create({ data: { email: "alice@example.com", name: "Alice" } }),
    prisma.user.create({ data: { email: "bob@example.com", name: "Bob" } }),
    prisma.user.create({ data: { email: "carol@example.com", name: "Carol" } }),
    prisma.user.create({ data: { email: "dave@example.com", name: "Dave" } }),
  ]);

  const [alice, bob, carol, dave] = users;

  // 投稿作成
  const posts = await Promise.all([
    prisma.post.create({
      data: { authorId: alice.id, content: "Hello from Alice! First post." },
    }),
    prisma.post.create({
      data: { authorId: alice.id, content: "Alice's second post about TypeScript." },
    }),
    prisma.post.create({
      data: { authorId: bob.id, content: "Bob here. Learning Prisma today." },
    }),
    prisma.post.create({
      data: { authorId: carol.id, content: "Carol's post. Database design is fun!" },
    }),
    prisma.post.create({
      data: { authorId: dave.id, content: "Dave: PostgreSQL rocks." },
    }),
  ]);

  // コメント作成
  await Promise.all([
    prisma.comment.create({
      data: { postId: posts[0].id, authorId: bob.id, content: "Nice post Alice!" },
    }),
    prisma.comment.create({
      data: { postId: posts[0].id, authorId: carol.id, content: "I agree!" },
    }),
    prisma.comment.create({
      data: { postId: posts[2].id, authorId: alice.id, content: "Keep it up Bob!" },
    }),
    prisma.comment.create({
      data: { postId: posts[3].id, authorId: dave.id, content: "Great point Carol." },
    }),
  ]);

  // フォロー関係（Alice -> Bob, Carol / Bob -> Alice, Carol / Carol -> Alice）
  await Promise.all([
    prisma.follow.create({ data: { followerId: alice.id, followingId: bob.id } }),
    prisma.follow.create({ data: { followerId: alice.id, followingId: carol.id } }),
    prisma.follow.create({ data: { followerId: bob.id, followingId: alice.id } }),
    prisma.follow.create({ data: { followerId: bob.id, followingId: carol.id } }),
    prisma.follow.create({ data: { followerId: carol.id, followingId: alice.id } }),
  ]);

  // いいね
  await Promise.all([
    prisma.like.create({ data: { userId: bob.id, postId: posts[0].id } }),
    prisma.like.create({ data: { userId: carol.id, postId: posts[0].id } }),
    prisma.like.create({ data: { userId: alice.id, postId: posts[2].id } }),
    prisma.like.create({ data: { userId: dave.id, postId: posts[3].id } }),
  ]);

  console.log("Seed completed!");
  console.log("Users:", users.length);
  console.log("Posts:", posts.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
