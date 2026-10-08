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
