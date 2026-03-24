# Spring Boot 入門 - 簡単なWebアプリ

JavaによるWebアプリとSpring Bootの学習用プロジェクトです。

## 必要な環境

- Java 17 以上
- PostgreSQL（DB を使う場合）

## データベース（PostgreSQL + JDBC）

ローカルで PostgreSQL を起動し、`practice-springboot` データベースを作成してからアプリを起動します。

### 1. DB 作成

```bash
createdb practice-springboot
```

macOS ユーザ名で接続する場合（ユーザ名省略可）:

```bash
createdb practice-springboot
```

`postgres` ユーザで作成する場合:

```bash
createdb -U postgres practice-springboot
```

### 2. 接続設定

`application.properties` の `spring.datasource.username` / `spring.datasource.password` を必要に応じて変更してください。Homebrew の PostgreSQL ではパスワードなし（`trust`）で接続できることが多いです。

### 3. マイグレーション

アプリ起動時に Flyway が自動でマイグレーションを実行します。初回起動で `db/migration/V1__init_schema.sql` が適用され、`items` テーブルが作成されます。

## 起動方法

```bash
cd springboot
./gradlew bootRun
```

## アクセス

起動後、ブラウザで以下にアクセス：

| URL | 説明 |
|-----|------|
| http://localhost:3000/ | トップページ |
| http://localhost:3000/hello?name=太郎 | 挨拶ページ（名前を指定可能） |
| http://localhost:3000/api/hello?name=Spring | REST API（JSONレスポンス） |

## プロジェクト構成

```
springboot/
├── build.gradle               # Gradle設定　Next.jsでいうところのpackage.json
├── settings.gradle
├── gradlew / gradlew.bat      # Gradle Wrapper　Next.jsでいうところのnpm本体
├── src/main/java/.../
│   ├── HelloSpringBootApplication.java   # エントリーポイント
│   └── controller/
│       └── HelloController.java          # Webコントローラー
└── src/main/resources/
    ├── application.properties            # アプリ設定
    └── templates/                        # Thymeleafテンプレート
        ├── index.html
        └── hello.html
```

## Spring Boot のポイント

- **@SpringBootApplication**: アプリの起動と自動設定
- **@Controller**: Webリクエストを処理
- **@GetMapping**: GETリクエストのマッピング
- **Thymeleaf**: サーバーサイドのHTMLテンプレートエンジン
