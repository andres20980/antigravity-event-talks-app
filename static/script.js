document.addEventListener('DOMContentLoaded', () => {
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshSpinner = document.getElementById('refresh-spinner');
    const notesContainer = document.getElementById('notes-container');
    const tweetDrawer = document.getElementById('tweet-drawer');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const btnSendTweet = document.getElementById('btn-send-tweet');
    const charCount = document.getElementById('char-count');

    let selectedNotes = new Set();
    let allNotes = [];

    // Cargar notas al inicio
    fetchNotes();

    // Eventos
    btnRefresh.addEventListener('click', fetchNotes);
    
    btnCloseDrawer.addEventListener('click', () => {
        tweetDrawer.classList.add('hidden');
        // Desmarcar todas las notas si se cierra el panel de tweet
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.remove('selected');
            const checkbox = card.querySelector('.select-checkbox');
            if (checkbox) checkbox.checked = false;
        });
        selectedNotes.clear();
    });

    tweetTextarea.addEventListener('input', updateCharCount);

    btnSendTweet.addEventListener('click', () => {
        const text = tweetTextarea.value;
        if (text.length > 0 && text.length <= 280) {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank');
        }
    });

    // Obtener las notas del backend
    async function fetchNotes() {
        showLoading();
        try {
            const response = await fetch('/api/releases');
            if (!response.ok) throw new Error('Error al obtener las notas de lanzamiento');
            const data = await response.json();
            
            if (data.error) {
                showError(data.error);
            } else {
                allNotes = data.releases;
                renderNotes(data.releases);
            }
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    function showLoading() {
        btnRefresh.disabled = true;
        refreshSpinner.classList.remove('hidden');
        notesContainer.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }

    function hideLoading() {
        btnRefresh.disabled = false;
        refreshSpinner.classList.add('hidden');
    }

    function showError(message) {
        notesContainer.innerHTML = `
            <div class="error-state">
                <h3>¡Ups! Algo salió mal</h3>
                <p>${message}</p>
            </div>
        `;
    }

    function renderNotes(releases) {
        if (!releases || releases.length === 0) {
            notesContainer.innerHTML = '<p class="text-center">No hay notas de lanzamiento disponibles.</p>';
            return;
        }

        notesContainer.innerHTML = '';
        releases.forEach((note, index) => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.dataset.index = index;

            const cleanContent = note.content;

            card.innerHTML = `
                <div class="note-header">
                    <span class="note-date">${note.updated}</span>
                </div>
                <h2 class="note-title">${note.title}</h2>
                <div class="note-body">${cleanContent}</div>
                <div class="card-actions">
                    <label class="select-container">
                        <input type="checkbox" class="select-checkbox">
                        <span class="select-label">Seleccionar para Tweet</span>
                    </label>
                    <button class="btn-card-tweet" aria-label="Preparar Tweet para esta nota">
                        <svg class="twitter-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        Twittear esta
                    </button>
                </div>
            `;

            const checkbox = card.querySelector('.select-checkbox');
            const btnCardTweet = card.querySelector('.btn-card-tweet');

            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    card.classList.add('selected');
                    selectedNotes.add(index);
                } else {
                    card.classList.remove('selected');
                    selectedNotes.delete(index);
                }
                updateTweetFromSelection();
            });

            btnCardTweet.addEventListener('click', () => {
                prepareTweetFromSingleNote(note);
            });

            notesContainer.appendChild(card);
        });
    }

    // Preparar tweet a partir de una nota individual
    function prepareTweetFromSingleNote(note) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        
        let textContent = tempDiv.innerText || tempDiv.textContent || '';
        textContent = textContent.replace(/\s+/g, ' ').trim();

        const prefix = `BigQuery Update (${note.updated}): `;
        const suffix = ` #BigQuery #GCP`;
        const maxLength = 280 - prefix.length - suffix.length;
        
        let bodyText = textContent;
        if (bodyText.length > maxLength) {
            bodyText = bodyText.substring(0, maxLength - 3) + '...';
        }

        tweetTextarea.value = `${prefix}${bodyText}${suffix}`;
        updateCharCount();
        tweetDrawer.classList.remove('hidden');
        tweetTextarea.focus();
    }

    // Actualizar el contenido del Tweet en base a todas las notas seleccionadas
    function updateTweetFromSelection() {
        if (selectedNotes.size === 0) {
            tweetDrawer.classList.add('hidden');
            return;
        }

        const selectedList = Array.from(selectedNotes).map(idx => allNotes[idx]);
        let tweetContent = `Actualizaciones de #BigQuery:\n`;

        selectedList.forEach(note => {
            const dateStr = note.updated;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content;
            let text = tempDiv.innerText || tempDiv.textContent || '';
            text = text.replace(/\s+/g, ' ').trim();
            
            if (text.length > 60) {
                text = text.substring(0, 57) + '...';
            }
            tweetContent += `• [${dateStr}] ${text}\n`;
        });

        tweetContent += `#GoogleCloud #GCP`;

        if (tweetContent.length > 280) {
            tweetContent = tweetContent.substring(0, 277) + '...';
        }

        tweetTextarea.value = tweetContent;
        updateCharCount();
        tweetDrawer.classList.remove('hidden');
    }

    function updateCharCount() {
        const length = tweetTextarea.value.length;
        charCount.textContent = length;
        
        if (length > 280) {
            charCount.style.color = '#ef4444';
            btnSendTweet.disabled = true;
            btnSendTweet.style.opacity = '0.5';
            btnSendTweet.style.cursor = 'not-allowed';
        } else {
            charCount.style.color = 'var(--text-muted)';
            btnSendTweet.disabled = false;
            btnSendTweet.style.opacity = '1';
            btnSendTweet.style.cursor = 'pointer';
        }
    }
});
