(() => {
  'use strict';
  const voterStorageKey = 'baby-guess-voter-id-v1';
  const choiceButtons = [...document.querySelectorAll('[data-choice]')];
  const voteButton = document.querySelector('#vote-button');
  const votePanel = document.querySelector('#voting-panel');
  const resultsPanel = document.querySelector('#results-panel');
  const statusMessage = document.querySelector('#status-message');
  const shareButton = document.querySelector('#share-button');
  let selectedChoice = null;
  let busy = false;

  function getVoterId() {
    let id;
    try { id = localStorage.getItem(voterStorageKey); } catch (_) { /* storage disabled */ }
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      try { localStorage.setItem(voterStorageKey, id); } catch (_) { /* private browsing */ }
    }
    return id;
  }
  // Stable for this page visit even if local storage is unavailable.
  const voterId = getVoterId();

  function setStatus(message) { statusMessage.textContent = message || ''; }
  function setBusy(isBusy) {
    busy = isBusy;
    voteButton.disabled = isBusy || !selectedChoice;
    voteButton.textContent = isBusy ? '正在送出…' : '送出我的預測 ♡';
    choiceButtons.forEach(button => { button.disabled = isBusy; });
  }
  function renderResults(data) {
    const boy = Number(data.boy) || 0;
    const girl = Number(data.girl) || 0;
    const total = boy + girl;
    const boyPercent = total ? Math.round((boy / total) * 100) : 0;
    const girlPercent = total ? 100 - boyPercent : 0;
    document.querySelector('#thanks-line').textContent = data.yourChoice === 'boy' ? '你猜的是男寶寶！' : '你猜的是女寶寶！';
    document.querySelector('#boy-percent').textContent = `${boyPercent}%`;
    document.querySelector('#girl-percent').textContent = `${girlPercent}%`;
    document.querySelector('#boy-bar').style.width = `${boyPercent}%`;
    document.querySelector('#girl-bar').style.width = `${girlPercent}%`;
    document.querySelector('#total-votes').textContent = total.toLocaleString('zh-TW');
    votePanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    setStatus('');
  }
  async function readJson(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '目前無法連線，請稍後再試。');
    return data;
  }
  choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (busy) return;
      selectedChoice = button.dataset.choice;
      choiceButtons.forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      voteButton.disabled = false;
      setStatus('');
    });
  });
  voteButton.addEventListener('click', async () => {
    if (!selectedChoice || busy) return;
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/api/votes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, choice: selectedChoice })
      });
      renderResults(await readJson(response));
    } catch (error) {
      setStatus(error.message || '送出失敗，請再試一次。');
    } finally { setBusy(false); }
  });
  shareButton.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    const data = { title: '寶寶性別猜猜樂', text: '你猜我們的寶寶是男生還是女生？來投票吧！🩵🩷', url };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(url); shareButton.textContent = '連結已複製 ✓'; }
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('分享失敗，可以直接複製瀏覽器網址。');
    }
  });
  // Already voted on this browser? Restore the results immediately.
  fetch(`/api/votes?voterId=${encodeURIComponent(voterId)}`)
    .then(readJson)
    .then(data => { if (data.yourChoice) renderResults(data); })
    .catch(() => { /* Keep voting available; submission will show a useful error. */ });
})();
