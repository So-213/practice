# DB Learning API

SNS風ミニAPI - PostgreSQL + Prisma の学習用プロジェクト。

## 技術スタック

- Next.js 14 + TypeScript
- PostgreSQL (Docker)
- Prisma ORM
- npm

## プロジェクト構成

```
db-learning-api/
├── app/
│   ├── api/
│   │   ├── users/
│   │   │   ├── route.ts          # POST, GET
│   │   │   └── [id]/route.ts     # GET
│   │   ├── posts/
│   │   │   ├── route.ts          # POST, GET
│   │   │   └── [id]/
│   │   │       ├── comments/route.ts  # POST
│   │   │       └── like/route.ts      # POST
│   │   ├── feed/[userId]/route.ts      # GET
│   │   ├── follow/route.ts             # POST
│   │   └── debug/
│   │       ├── nplusone/route.ts       # GET (N+1問題の例)
│   │       ├── optimized/route.ts      # GET (N+1回避版)
│   │       └── explain/route.ts        # GET (EXPLAIN ANALYZE)
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts        # PrismaClient シングルトン + クエリログ
│   └── api-utils.ts     # エラーハンドリング
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── docker-compose.yml
├── .env
├── .env.example
├── package.json
└── README.md
```

## セットアップ手順

### 1. 依存関係インストール

```bash
cd db-learning-api
npm install
```

### 2. PostgreSQL 起動（Docker）

```bash
docker compose up -d
```

### 3. 環境変数

`.env` が存在しない場合は `.env.example` をコピー：

```bash
cp .env.example .env
```

### 4. マイグレーション

```bash
npm run db:migrate
```

初回はマイグレーション名を聞かれるので `init` などと入力。

### 5. シードデータ投入

```bash
npm run db:seed
```

### 6. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

---

## API 仕様

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/users | ユーザ作成 |
| GET | /api/users | ユーザ一覧 |
| GET | /api/users/:id | ユーザ取得 |
| POST | /api/posts | 投稿作成 |
| GET | /api/posts?authorId= | 投稿一覧 |
| GET | /api/feed/:userId | フォロー中のユーザの投稿 |
| POST | /api/posts/:id/comments | コメント作成 |
| POST | /api/posts/:id/like | いいね |
| POST | /api/follow | フォロー |
| GET | /api/debug/nplusone | N+1問題の例 |
| GET | /api/debug/optimized | N+1回避版 |
| GET | /api/debug/explain?sql= | EXPLAIN ANALYZE（ローカル専用） |

---

## curl 例

### ユーザ作成

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### ユーザ取得

```bash
# 作成時に返却された id を使用
curl http://localhost:3000/api/users/ユーザID
```

### 投稿作成

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"authorId":"ユーザID","content":"Hello World!"}'
```

### 投稿一覧（authorId でフィルタ）

```bash
curl "http://localhost:3000/api/posts?authorId=ユーザID"
```

### フィード取得

```bash
curl http://localhost:3000/api/feed/ユーザID
```

### コメント作成

```bash
curl -X POST http://localhost:3000/api/posts/投稿ID/comments \
  -H "Content-Type: application/json" \
  -d '{"authorId":"ユーザID","content":"Nice post!"}'
```

### いいね

```bash
curl -X POST http://localhost:3000/api/posts/投稿ID/like \
  -H "Content-Type: application/json" \
  -d '{"userId":"ユーザID"}'
```

### フォロー

```bash
curl -X POST http://localhost:3000/api/follow \
  -H "Content-Type: application/json" \
  -d '{"followerId":"フォロワーID","followingId":"フォロー先ID"}'
```

### N+1 問題の例（クエリログを確認）

```bash
curl http://localhost:3000/api/debug/nplusone?limit=5
```

### N+1 回避版

```bash
curl http://localhost:3000/api/debug/optimized?limit=5
```

### EXPLAIN ANALYZE（学習用）

```bash
curl "http://localhost:3000/api/debug/explain?sql=SELECT%20*%20FROM%20%22User%22%20LIMIT%201"
```

---

## DB 設計メモ

- **UUID 主キー**: 全テーブルで `@default(uuid())`
- **一意制約**: `User.email`, `Like(userId, postId)`, `Follow(followerId, followingId)`
- **カスケード削除**: User 削除時は Post/Comment/Like/Follow を CASCADE
- **インデックス**: `Post.authorId`, `Comment.postId`, `Like.postId`, `Follow.followerId` など

## Prisma クエリログ

開発時は `lib/prisma.ts` でクエリログを有効化。ターミナルに発行された SQL が出力される。
