import os
from dotenv import load_dotenv
from flask import Flask, render_template  # 使うものに応じて変更してください

load_dotenv()

# Flaskアプリの本体（これが gunicorn app:app の後半の "app" に対応します）
app = Flask(__name__)

# 環境変数からデータベースURLを取得
DATABASE_URL = os.environ.get("DATABASE_URL")

# --- 以下に元々書いていたルーティング等の処理 ---

@app.route("/")
def index():
    return "Hello World" # 元の処理

if __name__ == "__main__":
    app.run()
