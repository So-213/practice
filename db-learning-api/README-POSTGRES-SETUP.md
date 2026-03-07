# PostgreSQL データベース・ユーザー設定ガイド

このドキュメントでは、PostgreSQL で以下を行う手順を説明します。

1. 新しいデータベースを作成する
2. 一般ユーザーを作成する
3. そのユーザーに DB への読み取り権限のみを付与する
4. その一般ユーザーとして DB に接続するdb-learning-api

---

## 前提条件

- PostgreSQL が起動していること（`brew services start postgresql@17`）
- スーパーユーザー（Mac ユーザー）で接続できること

---

## ① 新しいデータベースを作成する

スーパーユーザーで接続し、`CREATE DATABASE` を実行します。

```bash
psql postgres -c "CREATE DATABASE my_app_db;"
```

作成を確認するには：

```bash
psql postgres -l
```

---

## ② 一般ユーザーを作成する

`CREATE USER` でログイン可能な一般ユーザーを作成します。

```bash
psql postgres -c "CREATE USER readonly_user WITH PASSWORD 'your_secure_password';"
```

- `readonly_user` … ユーザー名（任意の名前に変更可能）
- `your_secure_password` … パスワード（本番では強力なパスワードを使用すること）

作成を確認するには：

```bash
psql postgres -c "\du"
```

---

## ③ 読み取り権限のみを付与する

対象 DB に対して、そのユーザーに読み取り専用の権限を付与します。

### 3-1. データベースへの接続権限

```bash
psql postgres -c "GRANT CONNECT ON DATABASE my_app_db TO readonly_user;"
```

### 3-2. public スキーマの使用権限

```bash
psql postgres -c "GRANT USAGE ON SCHEMA public TO readonly_user;"
```

### 3-3. 既存テーブルへの SELECT 権限

```bash
psql postgres -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;"
```

※ 上記は `postgres` データベースで実行していますが、`GRANT ... ON ALL TABLES` は対象 DB 内のテーブルに対して効きます。PostgreSQL の仕様上、**対象 DB に接続した状態**で実行する必要があります。

正しい手順は以下の通りです。

```bash
# my_app_db に接続して権限を付与
psql my_app_db -c "GRANT USAGE ON SCHEMA public TO readonly_user;"
psql my_app_db -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;"
```

### 3-4. 今後作成されるテーブルにも SELECT を付与（任意）

将来 `public` スキーマに追加されるテーブルにも、自動で SELECT を付与したい場合：

```bash
psql my_app_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;"
```

※ スーパーユーザーが作成するテーブルにのみ適用されます。一般ユーザーがテーブルを作成する場合は、そのユーザーで `ALTER DEFAULT PRIVILEGES` を実行する必要があります。

### 権限付与の一括実行例

```bash
# 1. 接続権限（postgres から実行）
psql postgres -c "GRANT CONNECT ON DATABASE my_app_db TO readonly_user;"

# 2. スキーマ・テーブル権限（my_app_db に接続して実行）
psql my_app_db -c "GRANT USAGE ON SCHEMA public TO readonly_user;"
psql my_app_db -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;"
psql my_app_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;"
```

---

## ④ 一般ユーザーとして DB に接続する

### 方法 A: パスワードを対話で入力

```bash
psql -U readonly_user -d my_app_db
```

プロンプトでパスワードを入力します。

### 方法 B: 接続文字列でパスワードを指定

```bash
psql "postgresql://readonly_user:your_secure_password@localhost:5432/my_app_db"
```

### 方法 C: 環境変数でパスワードを指定

```bash
export PGPASSWORD='your_secure_password'
psql -U readonly_user -d my_app_db
```

### 接続確認

接続後、以下でユーザーと DB を確認できます。

```sql
SELECT current_user, current_database();
```

読み取り専用であることを確認するには、`INSERT` や `UPDATE` を試すとエラーになります。

```sql
-- 例: 存在するテーブルに対して（テーブルがない場合はスキップ）
-- INSERT INTO some_table VALUES (1);  -- 権限エラーになる想定
```

---

## まとめ: 実行順序の一覧

| 順番 | コマンド |
|------|----------|
| 1 | `psql postgres -c "CREATE DATABASE my_app_db;"` |
| 2 | `psql postgres -c "CREATE USER readonly_user WITH PASSWORD 'your_secure_password';"` |
| 3a | `psql postgres -c "GRANT CONNECT ON DATABASE my_app_db TO readonly_user;"` |
| 3b | `psql my_app_db -c "GRANT USAGE ON SCHEMA public TO readonly_user;"` |
| 3c | `psql my_app_db -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;"` |
| 3d | `psql my_app_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;"`（任意） |
| 4 | `psql -U readonly_user -d my_app_db` |

---

## 補足: 名前の変更について

- `my_app_db` … 作成するデータベース名
- `readonly_user` … 作成する一般ユーザー名
- `your_secure_password` … そのユーザーのパスワード

必要に応じて、これらをプロジェクトに合わせて変更してください。
