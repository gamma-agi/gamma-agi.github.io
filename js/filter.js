/* filter.js — Research page filtering + search */
(function () {
  function init() {
    var pills   = document.querySelectorAll('.filter-pill');
    var rows    = document.querySelectorAll('.paper-row-wrap');
    var empty   = document.getElementById('papers-empty');
    var searchEl = document.getElementById('paper-search');
    var clearBtn = document.getElementById('search-clear');

    if (!pills.length) return;

    var active = { theme: 'all', venue: 'all', year: 'all' };
    var query  = '';

    // Build a searchable text string for each row once
    var rowText = Array.from(rows).map(function (wrap) {
      return (wrap.textContent || '').replace(/\s+/g, ' ').toLowerCase();
    });

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var type = this.dataset.filterType;
        var val  = this.dataset.filterValue;
        document.querySelectorAll('.filter-pill[data-filter-type="' + type + '"]')
          .forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        active[type] = val;
        applyFilters();
      });
    });

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        query = this.value.trim().toLowerCase();
        if (clearBtn) clearBtn.hidden = query.length === 0;
        applyFilters();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchEl.value = '';
        query = '';
        clearBtn.hidden = true;
        searchEl.focus();
        applyFilters();
      });
    }

    function applyFilters() {
      var visible = 0;
      rows.forEach(function (wrap, i) {
        var theme = wrap.dataset.theme || '';
        var venue = wrap.dataset.venue || '';
        var year  = wrap.dataset.year  || '';

        var pillsOk = (active.theme === 'all' || theme === active.theme) &&
                      (active.venue === 'all' || venue === active.venue) &&
                      (active.year  === 'all' || year  === active.year);

        var searchOk = query === '' || rowText[i].indexOf(query) !== -1;

        if (pillsOk && searchOk) {
          wrap.style.display = '';
          visible++;
        } else {
          wrap.style.display = 'none';
          var expand  = wrap.querySelector('.paper-expand');
          var chevron = wrap.querySelector('.paper-row-chevron');
          if (expand)  expand.classList.remove('open');
          if (chevron) chevron.style.transform = '';
        }
      });

      if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    }

    // Click-to-expand rows
    document.querySelectorAll('.paper-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var wrap    = this.closest('.paper-row-wrap');
        var expand  = wrap && wrap.querySelector('.paper-expand');
        var chevron = this.querySelector('.paper-row-chevron');
        if (!expand) return;
        var isOpen = expand.classList.toggle('open');
        if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
      });
    });

    // Support ?theme= and ?venue= query params on page load
    var params = new URLSearchParams(window.location.search);
    ['theme', 'venue', 'year'].forEach(function (type) {
      var val = params.get(type);
      if (!val) return;
      var pill = document.querySelector('.filter-pill[data-filter-type="' + type + '"][data-filter-value="' + val + '"]');
      if (pill) pill.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
