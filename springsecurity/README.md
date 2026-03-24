# Spring Security 認証練習

Spring Security の概要把握を目的とした、セッション形式の認証練習プロジェクトです。

## 構成

- **認証方式**: セッション形式（HTTP Session）
- **DB**: H2 インメモリ（練習用・再起動でデータリセット）
- **後続**: セッションストアを Redis に移行する想定（`spring-session-data-redis` で対応可能）

## 起動

```bash
./gradlew bootRun
```

- アプリ: http://localhost:3000
- H2 コンソール: http://localhost:3000/h2-console

## サンプルユーザー

| ユーザー名 | パスワード | 役割 |
|-----------|-----------|------|
| user      | password  | USER |
| admin     | admin     | USER, ADMIN |

## Spring Security の主なポイント

1. **SecurityFilterChain** … 認可ルール（どの URL を保護するか）を定義
2. **UserDetailsService** … DB からユーザーを取得して `UserDetails` に変換
3. **PasswordEncoder** … パスワードを BCrypt でハッシュ
4. **formLogin / logout** … フォームログインとログアウトの設定

## Redis への移行

セッションを Redis に移行する場合:

1. `spring-session-data-redis` を依存に追加
2. `application.properties` に Redis 接続設定を追加
3. `@EnableRedisHttpSession` を有効化

ユーザー情報の永続化先（H2 / PostgreSQL など）はそのまま、セッションだけ Redis に出す構成が可能です。
