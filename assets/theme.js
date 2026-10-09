/* ============================================================
   사이트 정체성 — 여기 한 곳만 고치면 워터마크·공유·출처가 모두 바뀝니다
   ============================================================ */
var SITE = {
  name: 'AI Trend Analysis Reports',
  short: 'AI Trend Reports',
  url:  'https://vinni-tokyo.github.io/AI_Trend_Analysis_Reports/'
};

/* 눈에 보이는 대각선 워터마크 — 기본 꺼짐 (true 로 켤 수 있음) */
var SHOW_WATERMARK = false;

/* 보이지 않는 워터마크 — 디지털 복사본에 출처가 남는다
   ① 제로폭 서명: 문단마다 눈에 안 보이는 유니코드로 서명을 심는다.
      텍스트만 복사해 붙여넣어도 그대로 따라가며, verify.html 로 판별 가능.
   ② 화면 밖 출처줄: 전체 선택·복사하면 함께 복사되는 출처 문구.
   ③ 복사 이벤트: 일정 길이 이상 복사 시 출처를 덧붙인다. */
var INVISIBLE_MARK = true;
var MARK_TAG = 'ATR1';                       /* 서명 식별자 */

/* ============================================================
   메일링 리스트 — 구독 폼
   정적 사이트이므로 외부 발송 서비스에 위임합니다.
   endpoint 를 채우면 전 페이지(목록·소개·보고서 415건)에 폼이 자동으로 켜집니다.
     provider 'formspree'  mode 'ajax' — 페이지 이동 없이 제출
     provider 'buttondown' mode 'form' — 제공사 확인 페이지로 이동
     provider 'custom'     직접 만든 엔드포인트
   endpoint 가 비어 있으면 폼을 내보내지 않습니다(죽은 폼 공개 금지).
   로컬 미리보기는 주소 끝에 ?subscribe=preview 를 붙이십시오. */
var MAIL = {
  provider: 'formspree',
  endpoint: '',                 /* 예: https://formspree.io/f/xxxxxxxx */
  mode: 'ajax',                 /* 'ajax' | 'form' */
  field: 'email'                /* 이메일 입력의 name */
};

/* 밝기 전환: 시스템 설정 연동 + 수동 토글(localStorage 기억) */
(function () {
  var root = document.documentElement, KEY = 'theme';
  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);
  function bind() {
    var btn = document.getElementById('theme-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var cur = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

/* PDF 저장 버튼 — 보고서 페이지에 주입 (index.html 은 자체 버튼을 이미 가짐) */
(function () {
  var L = { ko: 'PDF 저장', ja: 'PDF 保存', en: 'Download PDF' };
  function lang() {
    // 페이지 안에서 언어를 바꾸는 화면(index·about)은 선택된 언어를 따른다
    var sel = document.querySelector('.lang-selector-btn.active');
    if (sel && sel.dataset.lang) return sel.dataset.lang;
    return (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2);
  }
  function label() { return L[lang()] || L.ko; }
  function inject() {
    if (document.querySelector('.pdf-download-section')) return;  // 이미 있으면 건너뜀
    if (document.getElementById('pdf-btn-label')) return;         // 목록 페이지는 자체 버튼을 가짐
    if (!document.querySelector('.container')) return;            // 보고서 골격이 아니면 생략
    var wrap = document.createElement('div');
    wrap.className = 'pdf-download-section';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pdf-download-btn';
    btn.title = label();
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>' +
      '<span></span>';
    btn.querySelector('span').textContent = label();
    btn.addEventListener('click', function () { window.print(); });
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
    // 언어 버튼을 누르면 문구도 따라간다
    document.querySelectorAll('.lang-selector-btn').forEach(function (b2) {
      b2.addEventListener('click', function () {
        setTimeout(function () {
          var sp = btn.querySelector('span');
          if (sp) { sp.textContent = label(); btn.title = label(); }
        }, 0);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();


/* ============================================================
   워터마크 + 출처 표기
   ⚠️ 정적 사이트라 '누가 가져갔는지' 추적은 불가능합니다.
      가능한 것은 (1) 복사·캡처·PDF 어디에 실려도 출처가 함께 남고
      (2) 검색엔진이 원본을 원저작물로 인식하게 만드는 것입니다.
   ============================================================ */
(function () {
  function lang2() {
    var sel = document.querySelector('.lang-selector-btn.active');
    if (sel && sel.dataset.lang) return sel.dataset.lang;
    return (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2);
  }

  /* ① 화면·인쇄 워터마크 (본문 뒤, 클릭 통과) */
  function watermark() {
    if (!SHOW_WATERMARK) return;
    var host = document.querySelector('.container');
    if (!host || host.querySelector('.wm-layer')) return;
    var layer = document.createElement('div');
    layer.className = 'wm-layer';
    layer.setAttribute('aria-hidden', 'true');
    var txt = SITE.short + ' · ' + SITE.url.replace(/^https?:\/\//, '');
    var rows = Math.ceil((window.innerHeight * 1.4) / 74) + 2;   /* 뷰포트를 덮을 만큼 */
    for (var i = 0; i < rows; i++) {
      var row = document.createElement('div');
      row.className = 'wm-row';
      row.textContent = (txt + '   ').repeat(8);
      layer.appendChild(row);
    }
    host.insertBefore(layer, host.firstChild);
  }

  /* ② 인쇄 시 매 페이지 하단에 출처 */
  function printFoot() {
    if (document.querySelector('.print-source')) return;
    var d = document.createElement('div');
    d.className = 'print-source';
    d.setAttribute('aria-hidden', 'true');
    d.textContent = SITE.name + ' · ' + location.href.replace(/^file:.*\//, SITE.url);
    document.body.appendChild(d);
  }

  /* ③ 본문을 복사하면 출처가 따라붙는다 */
  function copyAttribution() {
    document.addEventListener('copy', function (e) {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      var text = sel.toString();
      if (text.trim().length < 80) return;            /* 짧은 인용은 그대로 둔다 */
      var L = lang2();
      var line = { ko: '출처', en: 'Source', ja: '出典' }[L] || '출처';
      var url  = location.href.indexOf('http') === 0 ? location.href : SITE.url;
      var note = '\n\n— ' + line + ': ' + (document.title || SITE.name) + ' / ' + SITE.name + '\n' + url;
      e.clipboardData.setData('text/plain', text + note);
      e.preventDefault();
    });
  }

  /* ④ 원본 표기 — 검색엔진이 원저작물을 가리키게 */
  function canonical() {
    if (location.protocol === 'file:') return;
    if (!document.querySelector('link[rel="canonical"]')) {
      var l = document.createElement('link');
      l.rel = 'canonical'; l.href = location.href.split('#')[0];
      document.head.appendChild(l);
    }
    if (!document.querySelector('meta[property="og:site_name"]')) {
      var m = document.createElement('meta');
      m.setAttribute('property', 'og:site_name'); m.content = SITE.name;
      document.head.appendChild(m);
    }
  }

  /* ① 제로폭 서명 — ZWSP(0) / ZWNJ(1), 시작·끝은 WORD JOINER */
  function zwEncode(str) {
    var bits = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i).toString(2);
      bits += '00000000'.slice(c.length) + c;
    }
    var out = '\u2060';
    for (var j = 0; j < bits.length; j++) out += (bits[j] === '1' ? '\u200C' : '\u200B');
    return out + '\u2060';
  }

  function invisibleMark() {
    if (!INVISIBLE_MARK) return;
    var host = document.querySelector('.content') || document.querySelector('.container');
    if (!host || host.dataset.marked) return;
    host.dataset.marked = '1';

    var sig = zwEncode(MARK_TAG);
    var paras = host.querySelectorAll('p, li, td');
    var n = 0;
    paras.forEach(function (el, i) {
      if (el.closest('.wm-layer, .interaction-section, .print-source')) return;
      if ((el.textContent || '').trim().length < 60) return;
      if (i % 2) return;                                  /* 절반에만 — 용량 절약 */
      el.appendChild(document.createTextNode(sig));
      n++;
    });

    /* ② 화면 밖 출처줄 — display:none 은 복사되지 않으므로 화면 밖으로 밀어낸다 */
    function srcLine() {
      var d = document.createElement('div');
      d.className = 'copy-source';
      d.setAttribute('aria-hidden', 'true');
      d.textContent = '[' + SITE.name + '] ' +
        (document.title || '') + ' — ' +
        (location.protocol === 'file:' ? SITE.url : location.href.split('#')[0]);
      return d;
    }
    host.insertBefore(srcLine(), host.firstChild);
    host.appendChild(srcLine());
    return n;
  }

  function run() { watermark(); invisibleMark(); printFoot(); copyAttribution(); canonical(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

/* ============================================================
   링크 공유 — Web Share API, 없으면 클립보드 복사
   ============================================================ */
(function () {
  var T = {
    ko: { btn: '공유', copied: '링크를 복사했습니다', fail: '복사에 실패했습니다' },
    en: { btn: 'Share', copied: 'Link copied', fail: 'Copy failed' },
    ja: { btn: '共有', copied: 'リンクをコピーしました', fail: 'コピーに失敗しました' }
  };
  function L() {
    var sel = document.querySelector('.lang-selector-btn.active');
    var l = (sel && sel.dataset.lang) || (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2);
    return T[l] || T.ko;
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'share-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function(){ t.remove(); }, 250); }, 1800);
  }
  function shareUrl() {
    return location.protocol === 'file:' ? SITE.url : location.href.split('#')[0];
  }
  function doShare() {
    var url = shareUrl(), title = document.title || SITE.name;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }
    var done = function () { toast(L().copied); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { toast(L().fail); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast(L().fail); }
      ta.remove();
    }
  }
  function inject() {
    var host = document.querySelector('.pdf-download-section');
    if (!host || host.querySelector('.share-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'share-btn'; b.title = L().btn;
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"></path></svg><span></span>';
    b.querySelector('span').textContent = L().btn;
    b.addEventListener('click', doShare);
    host.insertBefore(b, host.firstChild);
    document.querySelectorAll('.lang-selector-btn').forEach(function (x) {
      x.addEventListener('click', function () {
        setTimeout(function () {
          var sp = b.querySelector('span'); if (sp) { sp.textContent = L().btn; b.title = L().btn; }
        }, 0);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();

/* ============================================================
   메일링 리스트 — 폼 주입 · 제출 · 3언어
   ============================================================ */
(function () {
  var T = {
    ko: { h: '새 보고서를 메일로 받아보세요',
          p: '발행 시점에 요약과 링크를 보내드립니다. 광고는 보내지 않으며, 언제든 한 번의 클릭으로 해지할 수 있습니다.',
          ph: '이메일 주소', btn: '구독', busy: '보내는 중…',
          ok: '구독 신청이 접수되었습니다. 확인 메일을 확인해 주세요.',
          dup: '이미 구독 중인 주소입니다.',
          bad: '이메일 주소 형식을 확인해 주세요.',
          err: '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          note: '구독에 사용한 주소는 발송 목적으로만 쓰입니다.' },
    en: { h: 'Get new reports by email',
          p: 'A summary and a link, sent when each report is published. No advertising, and you can unsubscribe in one click at any time.',
          ph: 'Email address', btn: 'Subscribe', busy: 'Sending…',
          ok: 'Thanks — please check your inbox to confirm.',
          dup: 'That address is already subscribed.',
          bad: 'Please check the email address.',
          err: 'Could not send. Please try again shortly.',
          note: 'Your address is used only to send these reports.' },
    ja: { h: '新しいレポートをメールで受け取る',
          p: '公開のたびに要約とリンクをお送りします。広告は送らず、いつでもワンクリックで解除できます。',
          ph: 'メールアドレス', btn: '購読', busy: '送信中…',
          ok: '受け付けました。確認メールをご確認ください。',
          dup: 'すでに購読済みのアドレスです。',
          bad: 'メールアドレスをご確認ください。',
          err: '送信できませんでした。しばらくしてからお試しください。',
          note: 'いただいた住所は配信のみに使用します。' }
  };
  function lang() {
    var sel = document.querySelector('.lang-selector-btn.active');
    return (sel && sel.dataset.lang) || (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2);
  }
  function L() { return T[lang()] || T.ko; }

  var preview = /[?&]subscribe=preview/.test(location.search);
  function on() { return !!(MAIL && MAIL.endpoint) || preview; }

  function build() {
    var t = L();
    var sec = document.createElement('section');
    sec.className = 'subscribe';
    sec.setAttribute('aria-labelledby', 'subscribe-h');
    sec.innerHTML =
      '<div class="subscribe-inner">' +
        '<h2 class="subscribe-h" id="subscribe-h"></h2>' +
        '<p class="subscribe-p"></p>' +
        '<form class="subscribe-form" novalidate>' +
          '<label class="sr-only" for="subscribe-email"></label>' +
          '<input id="subscribe-email" type="email" autocomplete="email" required>' +
          '<button type="submit"></button>' +
        '</form>' +
        '<p class="subscribe-msg" role="status" aria-live="polite"></p>' +
        '<p class="subscribe-note"></p>' +
      '</div>';
    var f = sec.querySelector('form'), inp = sec.querySelector('input'), btn = sec.querySelector('button');
    inp.name = (MAIL && MAIL.field) || 'email';

    function paint() {
      var t = L();
      sec.querySelector('.subscribe-h').textContent = t.h;
      sec.querySelector('.subscribe-p').textContent = t.p;
      sec.querySelector('.subscribe-note').textContent = t.note;
      sec.querySelector('label').textContent = t.ph;
      inp.placeholder = t.ph;
      if (!btn.disabled) btn.textContent = t.btn;
    }
    paint();
    document.querySelectorAll('.lang-selector-btn').forEach(function (x) {
      x.addEventListener('click', function () { setTimeout(paint, 0); });
    });

    function say(msg, kind) {
      var m = sec.querySelector('.subscribe-msg');
      m.textContent = msg;
      m.className = 'subscribe-msg' + (kind ? ' is-' + kind : '');
    }

    f.addEventListener('submit', function (e) {
      var t = L(), v = inp.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        e.preventDefault(); say(t.bad, 'bad'); inp.focus(); return;
      }
      if (preview && !(MAIL && MAIL.endpoint)) {
        e.preventDefault();
        say('미리보기 모드입니다 — theme.js 의 MAIL.endpoint 를 채우면 실제로 전송됩니다.', 'bad');
        return;
      }
      if (MAIL.mode === 'form') { f.action = MAIL.endpoint; f.method = 'post'; return; }

      e.preventDefault();
      btn.disabled = true; btn.textContent = t.busy; say('');
      var body = new FormData(); body.append(inp.name, v);
      fetch(MAIL.endpoint, { method: 'POST', body: body, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (r.ok) { say(t.ok, 'ok'); f.reset(); return; }
          if (r.status === 409 || r.status === 422) { say(t.dup, 'bad'); return; }
          say(t.err, 'bad');
        })
        .catch(function () { say(t.err, 'bad'); })
        .then(function () { btn.disabled = false; btn.textContent = L().btn; });
    });
    return sec;
  }

  function inject() {
    if (!on() || document.querySelector('.subscribe')) return;
    var sec = build();
    var slot = document.getElementById('subscribe-slot');
    if (slot) { slot.appendChild(sec); return; }
    var foot = document.querySelector('footer');
    if (foot && foot.parentNode) { foot.parentNode.insertBefore(sec, foot); return; }
    var pdf = document.querySelector('.pdf-download-section');
    if (pdf && pdf.parentNode) { pdf.parentNode.insertBefore(sec, pdf.nextSibling); return; }
    document.body.appendChild(sec);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();

/* ============================================================
   넓은 표를 가로 스크롤 상자에 담는다
   좁은 화면에서 표가 페이지 전체를 밀어내 가로 스크롤이 생기던 문제를 막는다.
   보고서 HTML 을 건드리지 않고 여기서 감싼다.
   ============================================================ */
(function () {
  function wrap() {
    document.querySelectorAll('table').forEach(function (t) {
      var pa = t.parentElement;
      if (pa && pa.classList.contains('table-scroll')) return;
      var w = document.createElement('div');
      w.className = 'table-scroll';
      w.setAttribute('tabindex', '0');            /* 키보드로도 스크롤할 수 있게 */
      w.setAttribute('role', 'region');
      w.setAttribute('aria-label', '표');
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrap);
  else wrap();
})();
