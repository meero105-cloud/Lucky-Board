# Lucky Board

6/45 추첨 결과를 회차별로 보고, 내 번호를 저장해 자동으로 당첨을 확인하는 Android 앱. LuckyWheel과 같은 구성(Capacitor + `www/index.html` 한 장 + GitHub Actions 빌드)이고, LuckyWheel과 번호를 주고받는다.

- 패키지 이름: `com.beatfactory.luckyboard`
- 앱 이름: Lucky Board
- 빌드: GitHub Actions(`.github/workflows/android.yml`)가 서명된 AAB와 APK를 만든다.

## 기능

| 탭 | 내용 |
|---|---|
| 당첨번호 | 최신 회차, 다음 추첨까지 남은 시간, 1회부터 전체 회차 목록과 회차 검색 |
| 내 번호 | 45개 중 6개 고르기(자동 가능), 저장한 번호의 해당 회차 당첨 결과, 지난 전 회차에 대입한 결과 |
| 통계 | 전체/최근 100·50·10회 범위, 많이·적게·오래 안 나온 번호, 번호별 출현 횟수 |
| 설정 | 토요일 밤 9시 결과 알림, LuckyWheel 열기, 데이터 새로고침, 비공식 앱 안내 |

## 당첨번호 데이터

- 앱 안에 `www/draws.js`로 1회부터 전체 기록이 들어 있어 인터넷 없이도 보인다.
- 앱을 열 때 [smok95/lotto](https://github.com/smok95/lotto) 공개 JSON(`latest.json`)에서 새 회차를 받아 기기에 더한다.
- `.github/workflows/update-draws.yml`이 매주 토요일 밤과 일요일 아침에 `www/draws.js`를 갱신해 커밋한다. 빌드할 때도 한 번 갱신한다.
- 직접 갱신: `npm run update:draws`

## LuckyWheel 연동

- LuckyWheel → Lucky Board: `luckyboard://add?n=1,2,3,4,5,6&src=luckywheel` 링크를 열면 '내 번호'에 저장된다. `n`을 여러 번 넣으면 여러 세트.
- Lucky Board → LuckyWheel: 저장한 번호의 ↗ 버튼이 `luckywheel://pick?n=1,2,3,4,5,6`을 연다. LuckyWheel이 이 링크를 아직 모르면 앱만 열고, 설치돼 있지 않으면 Play 스토어로 간다.
- LuckyWheel 쪽에는 실제 당첨번호를 넣지 않는다(Play 정책). 링크 버튼만 둔다.

## 처음 한 번 할 일

1. **비밀값 등록**: 저장소 Settings → Secrets and variables → Actions에 LuckyWheel과 같은 `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`를 넣는다(같은 업로드 키를 써도 된다).
2. **빌드**: `main`에 올리거나 Actions → Android build → Run workflow. 끝나면 Artifacts에서 `luckyboard-build-N`을 받는다.
3. **개인정보처리방침 게시**: `site/luckyboard` 폴더를 `meero105-cloud.github.io` 저장소에 올린다. 주소는 `https://meero105-cloud.github.io/luckyboard/privacy/`.
4. **Play Console**: 새 앱 만들기 → 카테고리 '도구' 또는 '라이프스타일', 콘텐츠 등급 설문, 데이터 보안(수집 없음), 개인정보처리방침 URL 입력.

## 이름과 표현 주의

- 동행복권 로고·상표, 공식 앱처럼 보이는 표현을 쓰지 않는다. 스토어 설명에 "비공식 기록 앱, 정확한 결과는 공식 사이트에서 확인"을 넣는다.
- 복권 판매, 구매 대행, '당첨 예측'처럼 보이는 기능과 문구를 넣지 않는다.
