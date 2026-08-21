# お題ガチャ

Flask + Supabase(PostgreSQL) で作ったサーバーサイドWebアプリです。ボタンを押すとお題がひとつ表示される「お題ガチャ」を実装しています。

**構成**：アプリ本体は Render（や Railway など）でホスティングし、データベースは Supabase の PostgreSQL を使う形です。これにより、無料プランでもアプリの再起動でデータが消える心配がありません。

## 機能

- **お題一覧**：お題はSupabase(PostgreSQL)に保存。カテゴリは「絵を描く / 文章を書く / ゲームを作る / 写真を撮る / プログラムを書く / 暇つぶし」の6種類。
- **ガチャ**：ボタンを押すとカテゴリに応じてランダムにお題を1つ抽選し、履歴に自動保存。
- **履歴**：「いつ・どんなお題が出たか」を新しい順に一覧表示（`08/08 15:20` のような表示形式）。
- **お気に入り**：結果カードの☆ボタンで保存、一覧タブでいつでも確認・削除可能。
- **カテゴリ選択**：「すべて」＋6カテゴリのチップから選んでガチャを回せる。
- **お題を追加**：ユーザーが自由にお題とカテゴリを入力してDBに追加でき、以降のガチャ抽選対象になる。

## ローカルでの動作確認

### 1. Supabaseプロジェクトを作る

1. [supabase.com](https://supabase.com) にサインアップし、「New Project」でプロジェクトを作成（無料プランでOK）
2. プロジェクト作成時に設定したデータベースパスワードを控えておく
3. 左メニューの **Settings → Database → Connection string** を開き、**「Session pooler」** の接続文字列をコピー
   - IPv4環境からの接続に対応しており、Render等の一般的なホスティングと相性が良いためこちらを推奨します
   - `[YOUR-PASSWORD]` の部分を実際のパスワードに置き換えてください

### 2. 環境変数を設定

```bash
cd odai-gacha
cp .env.example .env
```
`.env` を開いて `DATABASE_URL` に、上でコピーした接続文字列を貼り付けてください。

### 3. 起動

```bash
python3 -m venv venv
source venv/bin/activate   # Windowsは venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

起動後、ブラウザで `http://127.0.0.1:5000` を開いてください。初回起動時にテーブルが自動作成され、初期のお題データが投入されます（SQL Editorでの手動セットアップは不要です）。

## 構成

```
odai-gacha/
├── app.py              # Flaskアプリ本体（ルーティング・Postgres接続）
├── requirements.txt
├── Procfile             # Render等がgunicornを起動するための設定
├── .env.example         # DATABASE_URLの書式サンプル
├── templates/
│   └── index.html       # メイン画面（タブ切り替えのSPA的な1ページ）
└── static/
    ├── style.css         # ガチャ／カプセルトイをモチーフにしたデザイン
    └── script.js         # タブ切り替え・API通信・画面更新
```

## DBスキーマ（Supabase/PostgreSQL）

- `prompts`：お題本体（`id`, `category`, `text`, `is_custom`, `created_at`）
- `history`：ガチャで出た記録（`id`, `prompt_id`, `text`, `category`, `drawn_at`）
- `favorites`：お気に入り（`id`, `prompt_id`, `text`, `category`, `added_at`、`UNIQUE(text, category)`で重複登録不可）

テーブルはアプリ起動時（`init_db()`）に自動で `CREATE TABLE IF NOT EXISTS` されるので、Supabase側で事前にSQLを書く必要はありません。

## 主なAPIエンドポイント

| メソッド | パス | 内容 |
|---|---|---|
| POST | `/api/gacha` | `{category}` を受け取りお題を1つ抽選、履歴に記録して返す |
| GET | `/api/history` | 履歴一覧（新しい順・最大200件） |
| GET | `/api/favorites` | お気に入り一覧 |
| POST | `/api/favorites` | `{text, category, prompt_id}` を保存 |
| DELETE | `/api/favorites/<id>` | お気に入り削除 |
| POST | `/api/prompts` | `{text, category}` で自作お題を追加 |
| GET | `/api/prompts` | 全お題一覧（デバッグ・確認用） |

## 公開する（Render + Supabase）

### 1. Supabase側

上記の「ローカルでの動作確認」の手順1で作成したプロジェクトをそのまま使います。追加の作業は不要です。

### 2. GitHubにpush

```bash
git init
git add .
git commit -m "お題ガチャ"
git branch -M main
git remote add origin <あなたのリポジトリURL>
git push -u origin main
```
`.env`（DBパスワードを含む）は `.gitignore` で除外済みなので、誤ってpushされる心配はありません。

### 3. Renderでデプロイ

1. [render.com](https://render.com) にサインアップし、「New +」→「Web Service」から対象リポジトリを選択
2. 設定：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`（`Procfile` があれば自動検出されます）
3. **Environment** タブで環境変数を追加：
   - Key: `DATABASE_URL`
   - Value: SupabaseのSession pooler接続文字列（ローカルの`.env`と同じもの）
4. デプロイ後に発行される `https://xxxx.onrender.com` のようなURLでアクセス可能

これで、Renderのアプリが再起動・再デプロイされても、データはSupabase側に保存されているため消えません。

### 注意点

- Supabaseの無料プランは**7日間データベースへのアクセスがないと自動的に一時停止**します。次にアクセスがあれば自動で再開しますが、しばらく使わない期間があると最初の1回だけ応答が遅くなることがあります。
- Renderの無料Webサービスも15分アクセスがないとスリープし、次のアクセス時に起動し直すため数十秒待たされることがあります（データが消えるわけではありません）。

## 補足（カテゴリについて）

ご要望文中の「お題一覧」の6カテゴリ（絵を描く／文章を書く／ゲームを作る／写真を撮る／プログラムを書く／暇つぶし）と、「カテゴリ選択」欄の5カテゴリ（ゲーム／創作／勉強／暇つぶし／プログラミング）で名称が少し異なっていたため、今回は実際のお題データと対応が取れる**前者の6カテゴリ**をそのままカテゴリ選択のボタンとしても採用しました。カテゴリ名や分類を変更したい場合は `app.py` の `CATEGORIES` と `SEED_PROMPTS` を編集するだけで反映されます。
