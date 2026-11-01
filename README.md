# 원이쌀밥 홈페이지 (정적 사이트)

순수 HTML/CSS/JS. 빌드 도구 없음, 모든 경로 상대 경로.

- `js/main.js` 는 `<head>` 에서 `defer` 없이 읽습니다. 파일 첫 줄이 `<html>` 에 `js` 표시를 붙여 첫 화면부터 페이드업이 깜빡임 없이 시작되고,
  파일을 못 받거나 초기화에 실패하면 표시가 붙지 않아(또는 떼어져) 모든 콘텐츠와 JS 없는 메뉴 링크가 그대로 보입니다.

## 1. 올리는 법
- `site/` 폴더 **안의 내용 전체**를 서브도메인(`icheon.wanteat.co.kr`) 웹 루트에 그대로 업로드합니다.
  (`index.html`, `favicon.ico`, `robots.txt`, `sitemap.xml`, `llms.txt`, `css/`, `js/`, `assets/`)
- 로컬 확인: `site/` 에서 `python -m http.server 8000` → http://localhost:8000
- 도메인이 바뀌면 `index.html` 의 canonical · og:url · og:image · JSON-LD image 주소를 함께 바꿉니다.

## 2. 자리 비움 6곳 교체 위치 (+ 지도)
`index.html` 에서 **`[자리 비움]`** 으로 검색하면 주석 바로 아래가 교체할 자리입니다. 자리 비움은 표의 1~5번과 (+)사업자정보 여섯 곳이고, 6번 지도는 이미 구글 지도가 들어 있어 바꿀 때만 5장을 따릅니다.

| # | 항목 | 위치(섹션) | 교체 방법 |
|---|---|---|---|
| 1 | 한식대가 증서·메달 사진 | 밥소믈리에 · 증빙 04 | `proof__img--empty` div → 다른 증빙과 같은 `<div class="proof__img"><picture>…</picture></div>` |
| 2 | 원이(元利)라는 이름 유래 | 브랜드 이야기 · 하단 박스 | `name-box__todo` 문단 내용을 유래 문구로 |
| 3 | 임금님표 이천쌀 우수업체 연도 | 브랜드 이야기 · 연표 | `<b class="tbd">연도 추후 입력</b>` → `<b>연도</b>` |
| 4 | 장어구이 사진 | 메뉴 · 풍천 장어구이 정식 카드 | `mcard__img--empty` div → `<div class="mcard__img"><picture>…</picture></div>` |
| 5 | 보리굴비 사진 | 메뉴 · 누룩소금 보리굴비 정식 카드 | 4번과 같은 방식 |
| 6 | 구글 지도 | 오시는 길 · 지도 칸 | iframe src 교체(5장) |
| (+) | 푸터 사업자정보 | 푸터 · 원이쌀밥 정보 | `<span class="tbd">추후 입력</span>` → 실제 사업자정보 |

새 사진은 `assets/img/` 에 **같은 이름으로 .jpg + .webp 두 장**을 넣고, `<img>` 에 `width`·`height`·`alt`·`loading="lazy"` 를 붙입니다.
(예: 카드 사진 가로 800px, JPG 품질 82 / WebP 품질 80)

## 3. 히어로 영상 교체
`assets/video/` 의 세 파일을 **같은 이름으로 덮어쓰기**만 하면 됩니다.
- `hero.webm` (VP9) · `hero.mp4` (H.264) · `hero-poster.jpg` (첫 장면 정지 이미지)
- 무음 · 15~20초 · 3~5MB 권장. 앞뒤 0.5초는 배경색(#172220)으로 페이드.

```
ffmpeg -ss 시작초 -t 16 -i 원본.mp4 -an -vf "scale=1600:-2:flags=lanczos,fade=t=in:st=0:d=0.5:color=0x172220,fade=t=out:st=15.5:d=0.5:color=0x172220" -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart hero.mp4
ffmpeg -ss 시작초 -t 16 -i 원본.mp4 -an -vf "(위와 같음)" -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 hero.webm
ffmpeg -ss 시작초 -i 원본.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 3 hero-poster.jpg
```

영상은 **데스크톱에서만** 재생됩니다. 모바일(768px 이하)·동작 줄이기 설정·데이터 절약·2G/3G 에서는
정지 이미지(모바일 `hero_lid_v`, 데스크톱 `hero_v13_b`)만 보입니다.

## 4. 검색 등록 절차
루트에 `robots.txt`(검색·AI 크롤러 허용) · `sitemap.xml`(대표 사진 3장 포함) · `llms.txt`(AI 검색용 요약)가 있습니다. 업로드 후 아래 순서로 등록합니다.

1. **네이버 서치어드바이저** (searchadvisor.naver.com)
   - 웹마스터 도구 → 사이트 등록에 `https://icheon.wanteat.co.kr` 입력 → 소유확인 방법 **HTML 태그** 선택
   - 받은 코드를 `index.html` `<head>` 상단 주석 줄 `<!-- 네이버 서치어드바이저: ... -->` 에 넣고 **주석 기호(`<!--`, `-->`)를 지운 뒤** 다시 업로드 → 소유확인
   - 요청 → 사이트맵 제출에 `https://icheon.wanteat.co.kr/sitemap.xml` 제출, 검증 → robots.txt 에서 수집 허용 확인
2. **구글 서치콘솔** (search.google.com/search-console)
   - 속성 추가 → **URL 접두어** `https://icheon.wanteat.co.kr/` → 확인 방법 **HTML 태그**
   - 코드를 `<!-- 구글 서치콘솔: ... -->` 줄에 넣고 주석을 풀어 업로드 → 확인
   - Sitemaps 메뉴에 `sitemap.xml` 제출
3. **네이버 플레이스** (스마트플레이스 관리) → 업체정보의 **홈페이지** 항목에 `https://icheon.wanteat.co.kr` 등록

### 가격·메뉴 변경 시 수정 위치 (4곳 모두 같은 값으로)
| # | 파일 | 찾는 곳 |
|---|---|---|
| 1 | `index.html` | 메뉴 섹션 `<section class="menu" id="menu">` 의 정식·일품요리·추가주문·주류 |
| 2 | `index.html` | `<head>` JSON-LD 의 `"@type": "Menu"` 블록(`hasMenu` 가 가리킴) — `"price"` 값, 메뉴 이름·설명 |
| 3 | `index.html` | FAQ 3번 "대표 메뉴와 가격은 어떻게 되나요?" — 화면(`<section class="faq">`)과 JSON-LD `"@type": "FAQPage"` **두 군데** |
| 4 | `llms.txt` | "## 메뉴·가격" 목록과 "대표 메뉴와 가격은 어떻게 되나요?" 답 |

- 영업시간·전화가 바뀌면 화면(오시는 길) · JSON-LD `openingHoursSpecification`/`telephone` · FAQ 5·6번(화면·JSON-LD) · `llms.txt` 를 함께 바꿉니다.
- 메뉴판 원본 이미지는 `assets/img/menu_board_2026.jpg/.webp` 입니다. 새 메뉴판으로 바꾸면 메뉴 섹션 "메뉴판 원본 보기" 링크의 파일명도 바꿉니다.
- 수정 후 `sitemap.xml` 의 `<lastmod>` 날짜를 수정한 날로 바꿉니다.
- 주변 명소·골프장(`<section class="nearby">`)의 장소나 거리를 바꾸면 `llms.txt` 의 "## 주변 명소"·"## 인근 골프장" 목록과 FAQ 10·11번(화면·JSON-LD·`llms.txt`)도 같이 바꿉니다.

## 5. 구글 지도 퍼가기 교체 절차
오시는 길의 지도 칸은 구글 지도 "지도 퍼가기" iframe 입니다. **무료이며 API 키·가입이 필요 없습니다.**
고칠 곳은 `index.html` 의 `<iframe class="map__embed" src="…">` 에서 **`src` 값 하나**뿐입니다(크기는 CSS가 칸에 맞춰 채웁니다).

1. 구글 지도(maps.google.com)에서 주소 또는 매장을 검색합니다.
2. 장소 패널의 **공유** → **지도 퍼가기** → **HTML 복사**를 누릅니다.
3. 복사한 코드의 `src="…"` 안 주소만 골라 `index.html` 의 `<iframe class="map__embed" src="…">` 의 `src` 와 바꿉니다.
   `width`·`height` 는 옮기지 않습니다.

- 지금은 구글 비즈니스 프로필의 **매장 핀('이천맛집 원이쌀밥')** 기준입니다. 프로필의 상호·주소('대월로 915')·영업시간은
  구글 지도 앱이나 business.google.com 에서 고치면 사이트 지도에도 그대로 반영됩니다(`src` 는 바꾸지 않아도 됩니다).
