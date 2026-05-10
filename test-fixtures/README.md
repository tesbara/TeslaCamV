# test-fixtures

E2E (Playwright) テストで使う fixture mp4。

`src/__tests__/fixtures/base.mp4` のコピー。 vitest browser test では `?url` import で
直接読めるが、 Playwright E2E は dev server 経由で fetch するためここに配置している。

`/TeslaCamV/test-fixtures/base.mp4` で参照可能 (= vite の base 設定 `/TeslaCamV/` 経由)。

production build にも含まれるが、 ファイルサイズが小さい (= 140KB) のと、 test-fixtures
パス名で性質が明示されるので大きな問題にはならない。 将来的に不要になったら削除すること。
