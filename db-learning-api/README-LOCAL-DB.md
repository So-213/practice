# ローカル PostgreSQL 版セットアップ手順

Docker を使わず、macOS に直接インストールした PostgreSQL で本プロジェクトを動かす手順です。

## 前提条件

- macOS
- Homebrew（未導入の場合は [brew.sh](https://brew.sh) からインストール）

---

## 1. PostgreSQL のインストール

```bash
brew install postgresql@17
```

インストール後、サービスを起動：

```bash
brew services start postgresql@17
```

初回起動時に自動で `postgres` ユーザと `localhost` 接続用の設定が作成されます。

サービスを停止するときは：

```bash
brew services stop postgresql@17
```

---

## 2. データベースの作成

ローカルの PostgreSQL に `db_learning` データベースを作成します。

```bash
createdb db_learning
```

`createdb` はデフォルトで現在の macOS ユーザ名で接続します。`postgres` ユーザで作成する場合：

```bash
createdb -U postgres db_learning
```

> **補足**: Homebrew の PostgreSQL では、デフォルトで `postgres` ユーザのパスワード認証が無効（`trust`）になっていることが多いです。そのため接続URLにパスワードを指定しなくても接続できます。

---

## 3. 依存関係のインストール

```bash
cd db-learning-api
npm install
```

---

## 4. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` を編集し、**ローカル PostgreSQL 用**の接続URLに変更します。

```env
# ローカル PostgreSQL 使用時（パスワードなし）
DATABASE_URL="postgresql://postgres@localhost:5432/db_learning?schema=public"
```

現在の macOS ユーザ名で PostgreSQL に接続している場合は、`postgres` の部分を自分のユーザ名に変更してください：

```env
DATABASE_URL="postgresql://あなたのユーザ名@localhost:5432/db_learning?schema=public"
```

パスワードを設定している場合は：

```env
DATABASE_URL="postgresql://ユーザ名:パスワード@localhost:5432/db_learning?schema=public"
```

---

## 5. マイグレーション

```bash
npm run db:migrate
```

初回はマイグレーション名を聞かれるので `init` などと入力。

---

## 6. シードデータ投入

```bash
npm run db:seed
```

---

## 7. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

---

## psql でローカル DB に接続する

Docker 版とは異なり、直接 `psql` コマンドで接続できます。

```bash
psql -h localhost -U postgres -d db_learning
```

現在の macOS ユーザで接続する場合（ユーザ名省略可）：

```bash
psql -d db_learning
```

---

## よくあるトラブル

### ポート 5432 が使用中

Docker の PostgreSQL が起動しているとポートが競合します。ローカル版を使う場合は Docker を停止してください：

```bash
docker compose down
```

### `createdb: command not found`

PostgreSQL のバイナリが PATH に含まれていない可能性があります。Homebrew の場合は：

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

（Intel Mac の場合は `/usr/local/opt/postgresql@17/bin` を指定）

### 接続エラー: `password authentication failed`

ローカルの `postgres` ユーザにパスワードが設定されている場合、`.env` の `DATABASE_URL` にパスワードを含めてください。

パスワードを設定・変更する場合：

```bash
psql -U postgres -d postgres -c "ALTER USER postgres PASSWORD '新しいパスワード';"
```

### データベースが存在しない

```bash
createdb db_learning
```

で作成済みか確認してください。一覧表示：

```bash
psql -U postgres -l
```

---

## Docker 版との違いまとめ

| 項目 | Docker 版 | ローカル版 |
|------|-----------|------------|
| 起動 | `docker compose up -d` | `brew services start postgresql@17` |
| DB 作成 | 自動 | `createdb db_learning` で手動作成 |
| 接続URL | `postgresql://postgres:postgres@localhost:5432/...` | `postgresql://postgres@localhost:5432/...`（パスワードなし） |
| psql 接続 | `docker exec -it db-learning-postgres psql ...` | `psql -d db_learning` |

それ以外の手順（マイグレーション、シード、開発サーバー起動）は同じです。
