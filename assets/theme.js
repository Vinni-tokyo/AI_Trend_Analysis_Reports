/* ============================================================
   사이트 정체성 — 여기 한 곳만 고치면 워터마크·공유·출처가 모두 바뀝니다
   ============================================================ */
var SITE = {
  name: 'AI Trend Analysis Reports',
  short: 'AI Trend Reports',
  url:  'https://vinni-tokyo.github.io/AI_Trend_Analysis_Reports/'
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

  function run() { watermark(); printFoot(); copyAttribution(); canonical(); }
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
