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
