document.addEventListener('DOMContentLoaded', () => {
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshSpinner = document.getElementById('refresh-spinner');
    const notesContainer = document.getElementById('notes-container');
    const tweetDrawer = document.getElementById('tweet-drawer');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const btnSendTweet = document.getElementById('btn-send-tweet');
    const charCount = document.getElementById('char-count');
    
    // Nuevos elementos
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const btnExportCsv = document.getElementById('btn-export-csv');

    let selectedNotes = new Set();
    let allNotes = [];

    // Inicializar Tema desde localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleIcon.textContent = '🌙';
    } else {
        themeToggleIcon.textContent = '☀️';
    }

    // Cargar notas al inicio
    fetchNotes();

    // Eventos
    btnRefresh.addEventListener('click', fetchNotes);
    
    btnCloseDrawer.addEventListener('click', () => {
        tweetDrawer.classList.add('hidden');
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

    // Evento de cambio de tema (Oscuro/Claro)
    btnThemeToggle.addEventListener('click', () => {
        const isLightTheme = document.body.classList.toggle('light-theme');
        if (isLightTheme) {
            themeToggleIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            themeToggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });

    // Evento de Exportación CSV
    btnExportCsv.addEventListener('click', () => {
        if (allNotes.length === 0) {
            alert('No hay notas disponibles para exportar.');
            return;
        }
        exportToCSV(allNotes);
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
                    <div class="card-actions-right">
                        <button class="btn-card-copy" aria-label="Copiar nota al portapapeles">
                            <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            <span class="copy-text">Copiar</span>
                        </button>
                        <button class="btn-card-tweet" aria-label="Preparar Tweet para esta nota">
                            <svg class="twitter-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            Twittear esta
                        </button>
                    </div>
                </div>
            `;

            const checkbox = card.querySelector('.select-checkbox');
            const btnCardTweet = card.querySelector('.btn-card-tweet');
            const btnCardCopy = card.querySelector('.btn-card-copy');

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

            btnCardCopy.addEventListener('click', () => {
                copyNoteToClipboard(note, btnCardCopy);
            });

            notesContainer.appendChild(card);
        });
    }

    // Copiar nota al portapapeles
    function copyNoteToClipboard(note, buttonElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        let textContent = tempDiv.innerText || tempDiv.textContent || '';
        textContent = textContent.replace(/\s+/g, ' ').trim();

        const fullText = `Fecha: ${note.updated}\nTítulo: ${note.title}\nDetalles:\n${textContent}`;

        navigator.clipboard.writeText(fullText).then(() => {
            const labelSpan = buttonElement.querySelector('.copy-text');
            const originalText = labelSpan.textContent;
            labelSpan.textContent = '¡Copiado!';
            buttonElement.style.borderColor = 'var(--accent)';
            buttonElement.style.color = 'var(--accent)';
            
            setTimeout(() => {
                labelSpan.textContent = originalText;
                buttonElement.style.borderColor = '';
                buttonElement.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar al portapapeles: ', err);
            alert('No se pudo copiar el texto automáticamente.');
        });
    }

    // Exportar notas de lanzamiento a CSV
    function exportToCSV(releases) {
        const headers = ['Fecha', 'Titulo', 'Detalle'];
        const csvRows = [];
        
        // Agregar cabeceras
        csvRows.push(headers.join(','));

        releases.forEach(note => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content;
            let textContent = tempDiv.innerText || tempDiv.textContent || '';
            textContent = textContent.replace(/\s+/g, ' ').trim();

            const date = `"${note.updated.replace(/"/g, '""')}"`;
            const title = `"${note.title.replace(/"/g, '""')}"`;
            const detail = `"${textContent.replace(/"/g, '""')}"`;

            csvRows.push([date, title, detail].join(','));
        });

        const csvContent = "\uFEFF" + csvRows.join('\n'); // BOM para soportar tildes en Excel
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'bigquery_release_notes.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
