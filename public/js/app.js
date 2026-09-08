(function () {
  'use strict';

  var SUPABASE_URL = 'https://wwirhsiivcmtizeibmer.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3aXJoc2lpdmNtdGl6ZWlibWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTY2OTEsImV4cCI6MjEwNDM3MjY5MX0.usgskEMZPN5oSAWus0H8Ep8XX8eYAKGIYiwzLmz_oT4';

  var supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  var TITLES = {
    magazine: 'Список доверенных магазинов',
    exchange: 'Список доверенных обменников'
  };

  var card = document.querySelector('.card');
  var menuLayer = card.querySelector('[data-layer="menu"]');
  var listLayer = card.querySelector('[data-layer="list"]');
  var listTitle = document.getElementById('list-title');
  var listItems = document.getElementById('list-items');
  var backBtn = card.querySelector('[data-action="back"]');

  var currentCategory = null;

  function showMenu() {
    currentCategory = null;
    menuLayer.style.display = '';
    listLayer.style.display = 'none';
  }

  function showList(category) {
    currentCategory = category;
    listTitle.textContent = TITLES[category] || '';
    listItems.innerHTML = '<p class="list__empty">Загрузка...</p>';
    menuLayer.style.display = 'none';
    listLayer.style.display = '';
    listItems.scrollTop = 0;

    if (!supabaseClient) {
      listItems.innerHTML = '<p class="list__empty">Ошибка загрузки</p>';
      return;
    }

    supabaseClient
      .from('buttons')
      .select('*')
      .eq('category', category)
      .order('position')
      .then(function (result) {
        if (result.error) {
          console.error(result.error);
          listItems.innerHTML = '<p class="list__empty">Ошибка загрузки</p>';
          return;
        }
        if (!result.data || !result.data.length) {
          listItems.innerHTML = '<p class="list__empty">Пусто</p>';
          return;
        }
        listItems.innerHTML = result.data
          .map(function (b, i) {
            return '<div class="list__item" style="animation-delay:' + (i * 0.06) + 's">' +
              '<a href="' + b.url + '" target="_blank" rel="noopener noreferrer">' + b.label + '</a>' +
              '</div>';
          })
          .join('');
      });
  }

  backBtn.addEventListener('click', function () {
    showMenu();
  });

  var catBtns = card.querySelectorAll('.pill[data-cat]');
  for (var i = 0; i < catBtns.length; i++) {
    catBtns[i].addEventListener('click', function (e) {
      e.preventDefault();
      showList(this.getAttribute('data-cat'));
    });
  }

  function loadSettings() {
    if (!supabaseClient) return;
    supabaseClient
      .from('settings')
      .select('*')
      .then(function (result) {
        if (result.error) return;
        var settings = {};
        for (var i = 0; i < result.data.length; i++) {
          var row = result.data[i];
          settings[row.key] = row.value;
        }
        var links = { owner_url: 'Владелец', channel_url: 'Канал', chat_url: 'Чат' };
        for (var key in links) {
          var el = document.getElementById('link-' + key.replace('_url', ''));
          if (!el) continue;
          el.href = settings[key] || '#';
          el.style.display = settings[key] ? '' : 'none';
        }
      });
  }

  if (supabaseClient) {
    loadSettings();

    supabaseClient.channel('buttons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buttons' }, function () {
        if (currentCategory) showList(currentCategory);
      })
      .subscribe();

    supabaseClient.channel('settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, loadSettings)
      .subscribe();
  }
})();