/* filter.js — Research page client-side filtering */
(function () {
  function init() {
    var pills    = document.querySelectorAll('.filter-pill');
    var rows     = document.querySelectorAll('.paper-row-wrap');
    var empty    = document.getElementById('papers-empty');

    if (!pills.length) return;

    var active = { theme: 'all', venue: 'all', year: 'all' };

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var type = this.dataset.filterType;
        var val  = this.dataset.filterValue;

        // Deactivate siblings of same type
        document.querySelectorAll('.filter-pill[data-filter-type="' + type + '"]')
          .forEach(function (p) { p.classList.remove('active'); });

        this.classList.add('active');
        active[type] = val;
        applyFilters();
      });
    });

    function applyFilters() {
      var visible = 0;
      rows.forEach(function (wrap) {
        var theme = wrap.dataset.theme || 'all';
        var venue = wrap.dataset.venue || 'all';
        var year  = wrap.dataset.year  || 'all';

        var ok = (active.theme === 'all' || theme === active.theme) &&
                 (active.venue === 'all' || venue === active.venue) &&
                 (active.year  === 'all' || year  === active.year);

        if (ok) {
          wrap.style.display = '';
          visible++;
        } else {
          wrap.style.display = 'none';
          // Collapse any open expansion
          var expand = wrap.querySelector('.paper-expand');
          if (expand) expand.classList.remove('open');
          var chevron = wrap.querySelector('.paper-row-chevron');
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
