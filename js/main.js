/* 원이쌀밥 — main.js
   스크롤 페이드업 · 내비 배경 전환 · 현재 섹션 탭 · 모바일 메뉴 · 아코디언 · 히어로 영상
   <head>에서 defer 없이 읽는다. 첫 줄에서 js 표시를 붙이므로 첫 화면부터 페이드업 초기 상태가 잡히고(깜빡임 없음),
   이 파일을 못 받으면 표시가 붙지 않아 모든 콘텐츠와 JS 없는 메뉴 링크가 그대로 보인다. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // 초기화 중 오류가 나면 js 표시를 떼고 메뉴 속성을 되돌려 JS 없는 상태(전부 표시 · :target 메뉴)로 둔다
  function boot() {
    try { init(); } catch (err) {
      root.classList.remove('js');
      var m = document.getElementById('mnav');
      if (m) ['role', 'aria-modal', 'aria-label', 'aria-hidden'].forEach(function (a) { m.removeAttribute(a); });
      if (document.body) document.body.style.overflow = '';
      throw err;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  function init() {
    var isMobile = window.matchMedia('(max-width: 760px)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasIO = 'IntersectionObserver' in window;

    // matchMedia change 구독(구형 Safari는 addListener)
    function onMedia(mq, fn) {
      if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
    }

    // 아코디언: 메뉴·주변 골프장은 모바일에서 첫 항목만 펼침, FAQ는 접힌 채 시작. 모두 aria-expanded 동기화
    function syncExpanded(d) {
      var s = d.querySelector('summary');
      function sync() { s.setAttribute('aria-expanded', d.open ? 'true' : 'false'); }
      d.addEventListener('toggle', sync);
      sync();
    }
    document.querySelectorAll('.acc__item').forEach(function (d, i) {
      if (isMobile && i > 0) d.removeAttribute('open');
      syncExpanded(d);
    });
    document.querySelectorAll('.golf__grp').forEach(function (d, i) {
      if (isMobile && i > 0) d.removeAttribute('open');
      syncExpanded(d);
    });
    document.querySelectorAll('.faq__item').forEach(function (d) { syncExpanded(d); });

    // 스크롤 페이드업 (동작 줄이기 설정이면 바로 표시)
    var reveals = document.querySelectorAll('.reveal');
    if (reduce || !hasIO) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // 내비 배경 전환
    var gnb = document.getElementById('gnb');
    function onScroll() { gnb.classList.toggle('is-solid', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 현재 섹션 탭 표시
    var tabs = document.querySelectorAll('.gnb__tabs a');
    // 탭 없는 섹션: 주변 명소(nearby)·방송(press)은 '공간' 탭, FAQ는 예약·영업시간 문답이 많아 '오시는 길' 탭으로 표시
    var map = { home: 0, sommelier: 1, story: 0, menu: 2, rice: 3, space: 4, nearby: 4, press: 4, faq: 5, visit: 5 };
    var sections = document.querySelectorAll('main > section[id]');
    function setTab(idx) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.classList.toggle('is-active', on);
        if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
    }
    if (hasIO) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.target.id in map) setTab(map[e.target.id]);
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    } else {
      // IntersectionObserver 미지원: 화면 45% 지점을 지난 마지막 섹션을 스크롤마다(rAF 1회) 계산
      var spyQueued = false;
      var spyCalc = function () {
        spyQueued = false;
        var line = window.innerHeight * 0.45, cur = null;
        sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
        if (cur && cur.id in map) setTab(map[cur.id]);
      };
      var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
      var spyQueue = function () {
        if (spyQueued) return;
        spyQueued = true;
        raf(spyCalc);
      };
      window.addEventListener('scroll', spyQueue, { passive: true });
      window.addEventListener('resize', spyQueue);
      spyCalc();
    }

    // 모바일 전체화면 메뉴(대화상자): 열린 동안 배경 inert + Tab 순환
    var mnav = document.getElementById('mnav');
    var burger = document.querySelector('button.gnb__burger');
    var brand = gnb.querySelector('.gnb__brand');
    var closeBtn = mnav.querySelector('button.mnav__close');
    var outside = [gnb, document.querySelector('main'), document.getElementById('footer'), document.querySelector('.mbar')];
    // 대화상자 선언은 JS로 열고 닫을 때만 붙인다(JS 없을 때는 :target으로 여는 일반 내비)
    mnav.setAttribute('role', 'dialog');
    mnav.setAttribute('aria-modal', 'true');
    mnav.setAttribute('aria-label', '전체 메뉴');
    mnav.setAttribute('aria-hidden', 'true');
    function setInert(on) {
      outside.forEach(function (el) {
        if (!el) return;
        if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
      });
    }
    function setNav(open) {
      if (mnav.classList.contains('is-open') === open) return;
      if (!open) {
        // 닫을 때는 배경을 먼저 풀고 포커스를 햄버거로 옮긴 뒤 메뉴를 숨김(숨긴 영역에 포커스가 남지 않게).
        // 햄버거가 숨겨진 폭(1025px 이상)이면 브랜드 로고 링크로 대신 옮긴다
        setInert(false);
        (burger.offsetParent !== null ? burger : brand).focus({ preventScroll: true });
      }
      mnav.classList.toggle('is-open', open);
      mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        setInert(true);
        // visibility 전환 직후에는 포커스가 안 잡히므로 한 박자 뒤에 이동
        setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 60);
      }
    }
    function focusables() {
      return [].filter.call(mnav.querySelectorAll('a[href], button:not([disabled])'), function (el) {
        return el.getClientRects().length > 0;
      });
    }
    // 메뉴를 연 채 데스크톱 폭으로 넓히면 닫는다(배경 inert 해제 포함)
    var mqWide = window.matchMedia('(min-width: 1025px)');
    onMedia(mqWide, function () { if (mqWide.matches) setNav(false); });
    burger.addEventListener('click', function () { setNav(true); });
    closeBtn.addEventListener('click', function () { setNav(false); });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setNav(false); return; }
      if (e.key !== 'Tab' || !mnav.classList.contains('is-open')) return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === first || !mnav.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !mnav.contains(cur))) { e.preventDefault(); first.focus(); }
    });

    // 히어로: 정지 이미지(<picture>)가 바뀌는 폭에 맞춰 대체 텍스트 양방향 갱신
    var mqSmall = window.matchMedia('(max-width: 768px)');
    var heroImg = document.querySelector('.hero__media img');
    function syncAlt() {
      if (!heroImg) return;
      heroImg.alt = heroImg.getAttribute(mqSmall.matches ? 'data-alt-mobile' : 'data-alt-desktop');
    }
    syncAlt();
    onMedia(mqSmall, syncAlt);

    // 히어로 영상: 데스크톱 + 동작 줄이기 꺼짐 + 데이터 절약 꺼짐 + 2g/3g 아님일 때만 연결.
    // 조건이 바뀌면(창 폭·동작 줄이기·네트워크) 다시 판단해 연결하거나 끊고 정지 이미지로 돌아간다.
    var video = document.querySelector('.hero__video');
    var toggle = document.querySelector('.hero__toggle');
    if (video) {
      var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      var conn = navigator.connection;
      var sources = video.querySelectorAll('source');
      var attached = false, userPaused = false, heroVisible = true;
      var started = false, failed = false, gen = 0; // started: 실제 재생 시작 여부 · gen: 연결 회차(지난 회차 결과 무시)

      var allowed = function () {
        var slow = !!conn && (conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || ''));
        return !mqSmall.matches && !mqReduce.matches && !slow;
      };
      // 버튼은 영상이 실제로 재생을 시작한 뒤에만 보이고, 아이콘·이름은 실제 재생 상태(video.paused)를 따른다
      var syncToggle = function () {
        if (!toggle) return;
        toggle.hidden = !attached || failed || !started;
        toggle.classList.toggle('is-paused', video.paused);
        toggle.setAttribute('aria-label', video.paused ? '영상 재생' : '영상 일시정지');
      };
      // 재생 실패(요청 실패·지원 포맷 없음·재생 거부): 버튼을 숨기고 아래 정지 이미지만 남긴다
      var fail = function () {
        if (!attached || failed) return;
        failed = true;
        video.pause();
        video.classList.remove('is-on');
        syncToggle();
      };
      var tryPlay = function () {
        if (!attached || failed || userPaused || !heroVisible) return;
        var g = gen, p = video.play();
        if (p && p.then) p.then(null, function (err) {
          // pause()·load()로 끊긴 요청(AbortError)은 실패가 아니다
          if (g === gen && !(err && err.name === 'AbortError')) fail();
        });
      };
      var attach = function () {
        attached = true; failed = false; started = false; gen++;
        video.poster = video.getAttribute('data-poster');
        sources.forEach(function (s) { s.src = s.getAttribute('data-src'); });
        video.muted = true;
        video.load();
        syncToggle();
        tryPlay();
      };
      var detach = function () {
        attached = false; started = false; gen++;
        video.pause();
        video.classList.remove('is-on');
        sources.forEach(function (s) { s.removeAttribute('src'); });
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.load(); // 소스를 비워 내려받기 중단 → 아래 정지 이미지가 보인다
        syncToggle();
      };
      var update = function () {
        var ok = allowed();
        if (ok && !attached) attach();
        else if (!ok && attached) detach();
      };

      // 영상 앞쪽 페이드(초록) 구간이 지난 뒤 정지 이미지 위로 겹쳐 띄움
      video.addEventListener('timeupdate', function () {
        if (attached && !failed && video.currentTime >= 0.5) video.classList.add('is-on');
      });
      video.addEventListener('playing', function () {
        if (!attached || failed) return;
        started = true;
        syncToggle();
      });
      video.addEventListener('pause', syncToggle);
      video.addEventListener('stalled', syncToggle);
      video.addEventListener('error', fail);
      // <source>를 하나도 못 쓰면 마지막 source에서 error가 난다(detach로 src를 비워 나는 것은 attached=false라 제외)
      if (sources.length) {
        sources[sources.length - 1].addEventListener('error', function () {
          if (video.networkState === 3) fail(); // NETWORK_NO_SOURCE
        });
      }
      if (toggle) {
        toggle.addEventListener('click', function () {
          if (video.paused) { userPaused = false; tryPlay(); } else { userPaused = true; video.pause(); }
        });
      }
      // 히어로가 화면 밖이면 일시정지
      if (hasIO) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
          if (heroVisible) tryPlay(); else video.pause();
        }).observe(document.getElementById('home'));
      }

      onMedia(mqSmall, update);
      onMedia(mqReduce, update);
      if (conn && conn.addEventListener) conn.addEventListener('change', update);
      update();
    }
  }
})();
