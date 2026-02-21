# Cursor 内ブラウザで React DevTools を使う

Cursor の MCP 内ブラウザ（cursor-ide-browser）には Chrome 拡張が入らないため、**スタンドアロン版 React DevTools** を使います。

## 手順

1. **開発サーバーを起動**
   ```bash
   npm start
   ```

2. **別ターミナルで React DevTools を起動**
   ```bash
   npm run devtools
   ```
   または
   ```bash
   npx react-devtools
   ```
   → スタンドアロン用ウィンドウが開き、ポート 8097 で待ち受けます。

3. **Cursor 内ブラウザでアプリを開く**
   - MCP の `browser_navigate` で `http://localhost:3000` を開く
   - ページ読み込み時に `public/index.html` 内の `<script src="http://localhost:8097">` がバックエンドを読み込み、スタンドアロンと接続されます。

4. **React DevTools で確認**
   - スタンドアロンウィンドウにコンポーネントツリーや props/state が表示されます。

## 注意

- **本番ビルド前**: `public/index.html` の  
  `<script src="http://localhost:8097"></script>` は削除するかコメントアウトしてください（本番では接続できず不要です）。
- ポートを変える場合は環境変数 `REACT_DEVTOOLS_PORT` を設定できます。
