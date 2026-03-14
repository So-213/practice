# Spring Boot 入門 - 簡単なWebアプリ

JavaによるWebアプリとSpring Bootの学習用プロジェクトです。

## 必要な環境

- Java 17 以上

## 起動方法

```bash
cd springboot
./gradlew bootRun
```

## アクセス

起動後、ブラウザで以下にアクセス：

| URL | 説明 |
|-----|------|
| http://localhost:8080/ | トップページ |
| http://localhost:8080/hello?name=太郎 | 挨拶ページ（名前を指定可能） |
| http://localhost:8080/api/hello?name=Spring | REST API（JSONレスポンス） |

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
