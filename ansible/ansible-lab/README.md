# Ansible 練習環境（ansible-lab）

Mac 上で Docker を使い、Ansible の **inventory・playbook・SSH 接続・冪等性** に加え、**Nginx リバースプロキシとロードバランシング** を練習するための環境です。

## 構成

```
Mac（Ansible コントロールノード）
  ↓ http://localhost:8080
reverse-proxy（Nginx コンテナ）
  ↓ ロードバランシング
target1:8000 / target2:8000（Python 簡易 HTTP サーバー）
```

```
ansible-lab/
├── docker-compose.yml   # 3 コンテナ（target1 / target2 / reverse-proxy）を起動
├── Dockerfile.target    # ターゲットサーバー用イメージ
├── nginx.conf           # リバースプロキシ設定
├── inventory.ini        # 管理対象サーバーの定義
├── playbook.yml         # 実行する playbook
└── README.md            # このファイル
```

| コンテナ | 接続先 | 役割 |
|---------|--------|------|
| reverse-proxy | `http://localhost:8080` | Nginx で target1 / target2 に振り分け |
| target1 | `localhost:2221`（SSH） | webservers グループ・HTTP サーバー（8000 番） |
| target2 | `localhost:2222`（SSH） | webservers グループ・HTTP サーバー（8000 番） |

- SSH ユーザー: `ansible`
- SSH パスワード: `ansible`
- sudo: パスワードなしで利用可能

### 各コンポーネントの役割

| コンポーネント | 役割 |
|--------------|------|
| **reverse-proxy** | Mac からの HTTP リクエスト（8080 番）を受け取り、Nginx の upstream で target1 / target2 にロードバランシングする |
| **target1 / target2** | Ansible で設定した Python 簡易 HTTP サーバー（8000 番）を動かし、それぞれ異なる `index.html` を返す |
| **Mac（Ansible）** | inventory / playbook を使って target1 / target2 を SSH 経由で設定する |

### systemd を使わない理由

Docker コンテナの中では **systemd（init システム）が通常動きません**。コンテナは 1 プロセスをメインで動かす設計のため、`systemctl start nginx` のようなサービス管理は使えません。

そのためこの環境では次のようにしています。

- **target1 / target2**: エントリポイントで `sshd` を直接起動。Web サーバーは playbook から `nohup python3 -m http.server` でバックグラウンド起動
- **reverse-proxy**: Nginx 公式イメージが Nginx プロセスを直接起動

本番の Linux サーバーでは systemd を使うことが多いですが、Docker 練習環境ではこの違いを意識しておくとよいです。

---

## 前提条件

- Mac に **Docker Desktop** がインストールされていること
- Mac に **Ansible** がインストールされていること

Ansible のインストール例（Homebrew）:

```bash
brew install ansible
```

---

## クイックスタート（実行コマンド例）

`ansible-lab` ディレクトリで順に実行します。

```bash
# 1. コンテナを起動・ビルド
docker compose up -d --build

# 2. Ansible から各サーバーに到達できるか確認
ansible -i inventory.ini webservers -m ping

# 3. playbook で Web サーバーをセットアップ
ansible-playbook -i inventory.ini playbook.yml

# 4. リバースプロキシ経由でアクセス（複数回実行すると振り分け先が変わる）
curl http://localhost:8080
curl http://localhost:8080
curl http://localhost:8080

# 5. 環境を削除
docker compose down
```

**期待する結果**

- `curl http://localhost:8080` のレスポンスに `Hello from target1` または `Hello from target2` が返る
- 複数回 curl すると、Nginx のロードバランシングにより target1 / target2 に交互またはラウンドロビンで振り分けられる

---

## 起動方法

```bash
cd ansible-lab
docker compose up -d --build
```

起動確認:

```bash
docker compose ps
```

`target1`・`target2`・`reverse-proxy` が `running` になっていれば OK です。

---

## SSH 確認方法

コンテナに SSH で接続できるか、Mac のターミナルから確認します。

```bash
# target1 へ接続
ssh -p 2221 ansible@127.0.0.1
# パスワード: ansible

# target2 へ接続
ssh -p 2222 ansible@127.0.0.1
# パスワード: ansible
```

接続できたら、以下も試してみてください。

```bash
# sudo がパスワードなしで使えるか確認
sudo whoami
# → root と表示されれば OK

# 接続を終了
exit
```

---

## ansible ping の実行方法

Ansible から各サーバーに到達できるか確認します。`ansible-lab` ディレクトリで実行してください。

```bash
ansible -i inventory.ini webservers -m ping
```

成功すると、次のような出力になります。

```
target1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
target2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

---

## playbook の実行方法

```bash
ansible-playbook -i inventory.ini playbook.yml
```

実行内容:

1. `curl` と `vim` がインストールされていることを確認（なければインストール）
2. `/tmp/hello-ansible.txt` を作成
3. `/var/www/html/index.html` を作成（target1 / target2 で文言が異なる）
4. Python 簡易 HTTP サーバーを 8000 番で起動（すでに起動済みならスキップ）

実行後、各ターゲットに直接アクセスして確認できます（Docker ネットワーク内からの確認例）:

```bash
# reverse-proxy コンテナから target1 / target2 へ直接アクセス
docker exec reverse-proxy curl -s http://target1:8000
docker exec reverse-proxy curl -s http://target2:8000
```

---

## リバースプロキシの確認方法

playbook 実行後、Mac から Nginx 経由でアクセスします。

```bash
curl http://localhost:8080
curl http://localhost:8080
curl http://localhost:8080
```

Nginx のデフォルトは **ラウンドロビン** です。複数回 curl すると `Hello from target1` と `Hello from target2` が交互に（または交互に近い形で）返ります。

---

## 冪等性（2 回目実行で changed が減る）

**冪等性（べんとうせい）** とは、「同じ操作を何度実行しても、結果が変わらない」性質のことです。Ansible の重要な特徴のひとつです。

同じ playbook を **もう一度** 実行してみてください。

```bash
ansible-playbook -i inventory.ini playbook.yml
```

1 回目と比べると、多くのタスクが `changed` ではなく **`ok`** になります。HTTP サーバー起動タスクも、8000 番がすでに LISTEN していればスキップされます。

| 実行回数 | 典型的な結果 |
|---------|-------------|
| 1 回目 | パッケージ確認、ファイル作成、HTTP サーバー起動などで `changed` が出る |
| 2 回目以降 | すでに望んだ状態なので、ほとんどが `ok`（変更なし） |

例:

```
TASK [Ensure curl is installed] ***
ok: [target1]
ok: [target2]

TASK [Start Python HTTP server on port 8000] ***
skipping: [target1]
skipping: [target2]
```

これが Ansible の冪等性です。設定管理ツールとして「現在の状態を望んだ状態に合わせる」ため、不要な変更は行いません。

---

## 環境の削除方法

コンテナを停止・削除する:

```bash
docker compose down
```

イメージも含めて完全に削除する場合:

```bash
docker compose down --rmi local
```

---

## トラブルシューティング

### `ansible ping` が失敗する

- コンテナが起動しているか確認: `docker compose ps`
- ポートが使用中でないか確認: `lsof -i :2221` / `lsof -i :2222`
- コンテナを再ビルド: `docker compose up -d --build`

### SSH 接続できない

- パスワードは `ansible` です（ユーザー名も `ansible`）
- ポート番号を間違えていないか確認（target1=2221, target2=2222）

### `curl http://localhost:8080` が失敗する

- `reverse-proxy` が起動しているか確認: `docker compose ps`
- playbook を実行済みか確認（target1 / target2 の 8000 番サーバーが必要）
- Nginx のログ確認: `docker logs reverse-proxy`
- 8080 番ポートの競合: `lsof -i :8080`

### curl しても常に同じ応答しか返らない

- playbook が両方の target で成功しているか確認
- `docker exec reverse-proxy curl -s http://target1:8000` と `target2:8000` を個別に試す
- 1 台だけ起動している場合、Nginx は正常でも片方の応答しか返りません
