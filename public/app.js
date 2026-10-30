(() => {
  'use strict';

  const voterStorageKey = 'baby-guess-voter-id-v1';
  const introScreen = document.querySelector('#intro-screen');
  const revealScreen = document.querySelector('#reveal-screen');
  const envelopeTrigger = document.querySelector('#envelope-trigger');
  const choiceButtons = [...document.querySelectorAll('[data-choice]')];
  const voteButton = document.querySelector('#vote-button');
  const nameInput = document.querySelector('#voter-name');
  const votePanel = document.querySelector('#voting-panel');
  const resultsPanel = document.querySelector('#results-panel');
  const statusMessage = document.querySelector('#status-message');
  const shareButton = document.querySelector('#share-button');
  const actualGender = window.BABY_REVEAL_CONFIG?.actualGender;
  const genderRevealPanel = document.querySelector('#gender-reveal-panel');
  const seeResultsButton = document.querySelector('#see-results-button');
  let submittedThisVisit = false;

  let selectedChoice = null;
  let busy = false;
  let introOpened = false;

  function getVoterId() {
    let id;
    try { id = localStorage.getItem(voterStorageKey); } catch (_) {}
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      try { localStorage.setItem(voterStorageKey, id); } catch (_) {}
    }
    return id;
  }

  const voterId = getVoterId();

  function setStatus(message) {
    statusMessage.textContent = message || '';
  }

  function updateVoteButtonState() {
    voteButton.disabled = busy || !selectedChoice || !nameInput.value.trim();
  }

  function setBusy(isBusy) {
    busy = isBusy;
    nameInput.disabled = isBusy;
    choiceButtons.forEach(button => { button.disabled = isBusy; });
    voteButton.textContent = isBusy ? 'Submitting...' : 'Submit my guess';
    updateVoteButtonState();
  }

  function showRevealScreen() {
    if (introOpened) return;
    introOpened = true;
    introScreen.classList.add('opening');
    window.setTimeout(() => {
      introScreen.classList.add('hidden');
      revealScreen.classList.remove('hidden');
      nameInput.focus({ preventScroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  function renderResults(data) {
    const boy = Number(data.boy) || 0;
    const girl = Number(data.girl) || 0;
    const total = boy + girl;
    const boyPercent = total ? Math.round((boy / total) * 100) : 0;
    const girlPercent = total ? 100 - boyPercent : 0;
    document.querySelector('#thanks-line').textContent = `${data.yourName ? `${data.yourName}, ` : ''}you guessed ${data.yourChoice === 'boy' ? 'Team Boy' : 'Team Girl'}!`;
    document.querySelector('#boy-percent').textContent = `${boyPercent}%`;
    document.querySelector('#girl-percent').textContent = `${girlPercent}%`;
    document.querySelector('#boy-bar').style.width = `${boyPercent}%`;
    document.querySelector('#girl-bar').style.width = `${girlPercent}%`;
    document.querySelector('#total-votes').textContent = total.toLocaleString('en-US');
    votePanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    if (submittedThisVisit && (actualGender === 'boy' || actualGender === 'girl')) {
      const isBoy = actualGender === 'boy';
      genderRevealPanel.classList.toggle('is-boy', isBoy);
      genderRevealPanel.classList.toggle('is-girl', !isBoy);
      document.querySelector('#gender-reveal-title').textContent = isBoy ? `It's a Boy!` : `It's a Girl!`;
      document.querySelector('#gender-reveal-symbol').textContent = isBoy ? '🩵' : '🩷';
      document.querySelector('#gender-reveal-caption').textContent = 'A little bundle of love is on the way!';
      resultsPanel.classList.add('hidden');
      genderRevealPanel.classList.remove('hidden');
    }
    setStatus('');
  }

  async function readJson(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Unable to connect right now. Please try again.');
    return data;
  }

  envelopeTrigger?.addEventListener('click', showRevealScreen);

  choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (busy) return;
      selectedChoice = button.dataset.choice;
      choiceButtons.forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      updateVoteButtonState();
      setStatus('');
    });
  });

  nameInput.addEventListener('input', () => {
    updateVoteButtonState();
    setStatus('');
  });

  voteButton.addEventListener('click', async () => {
    if (!selectedChoice || busy) return;
    const name = nameInput.value.trim();
    if (!name) {
      setStatus('Please enter your name or nickname first.');
      nameInput.focus();
      return;
    }

    setBusy(true);
    setStatus('');

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, choice: selectedChoice, name })
      });
      submittedThisVisit = true;
      renderResults(await readJson(response));
    } catch (error) {
      setStatus(error.message || 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  });

  seeResultsButton.addEventListener('click', () => {
    genderRevealPanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
  });

  shareButton.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    const data = {
      title: 'Baby Gender Guessing',
      text: 'Join us and vote: Team Boy or Team Girl? 🩵🩷',
      url
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        shareButton.textContent = 'Link copied ✓';
      }
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('Sharing failed. You can copy the URL from your browser.');
    }
  });

  fetch(`/api/votes?voterId=${encodeURIComponent(voterId)}`)
    .then(readJson)
    .then(data => {
      if (data.yourChoice) {
        // Keep the invitation envelope as the entry point even for returning visitors.
        renderResults(data);
      }
    })
    .catch(() => {
      /* Ignore and keep voting available. */
    });
})();
