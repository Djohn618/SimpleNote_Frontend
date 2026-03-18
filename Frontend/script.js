// SimpleNote - script.js
// Notizen via REST API laden, erstellen, bearbeiten, löschen
 
const API_URL = "http://localhost:8080/notes";
 
var selectedNote = null;
 
var noteColors = [
    "#F4845F",
    "#FFD166",
    "#F4A261",
    "#B5A8D5",
    "#C5E063",
    "#4ECDC4"
];
 
function getNoteColor(index) {
    return noteColors[index % noteColors.length];
}
 
 
// GET - Alle Notizen laden
function loadNotes() {
    fetch(API_URL)
        .then(function(response) {
            return response.json();
        })
        .then(function(notes) {
            renderNotes(notes);
        })
        .catch(function(error) {
            console.error("Fehler beim Laden:", error);
        });
}
 
// POST - Neue Notiz erstellen
function createNote(titel, inhalt) {
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titel, content: inhalt })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function() {
            loadNotes();
        })
        .catch(function(error) {
            console.error("Fehler beim Erstellen:", error);
        });
}
 
// PUT - Notiz aktualisieren
function updateNote(id, titel, inhalt) {
    fetch(API_URL + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titel, content: inhalt })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function() {
            loadNotes();
        })
        .catch(function(error) {
            console.error("Fehler beim Aktualisieren:", error);
        });
}
 
// DELETE - Notiz löschen
function deleteNote(noteId) {
    var bestaetigt = confirm("Möchtest du diese Notiz wirklich löschen?");
    if (!bestaetigt) return;
 
    fetch(API_URL + "/" + noteId, {
        method: "DELETE"
    })
        .then(function() {
            loadNotes();
        })
        .catch(function(error) {
            console.error("Fehler beim Löschen:", error);
        });
}
 
 
// Notizen anzeigen
function renderNotes(notes) {
    var grid = document.getElementById("notesGrid");
    var searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
 
    grid.innerHTML = "";
 
    var filteredNotes = [];
    for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var titelPasst = note.title.toLowerCase().indexOf(searchTerm) !== -1;
        var inhaltPasst = note.content.toLowerCase().indexOf(searchTerm) !== -1;
        if (titelPasst || inhaltPasst) {
            filteredNotes.push(note);
        }
    }
 
    if (filteredNotes.length === 0) {
        var hinweis = document.createElement("div");
        hinweis.className = "empty-message";
        if (searchTerm !== "") {
            hinweis.textContent = 'Keine Notizen für "' + searchTerm + '" gefunden.';
        } else {
            hinweis.textContent = "Noch keine Notizen vorhanden. Klicke auf + um deine erste zu erstellen!";
        }
        grid.appendChild(hinweis);
        return;
    }
 
    for (var j = 0; j < filteredNotes.length; j++) {
        var karte = createNoteCard(filteredNotes[j], j);
        grid.appendChild(karte);
    }
}
 
// Notizkarte erstellen
function createNoteCard(note, farbIndex) {
    var karte = document.createElement("div");
    karte.className = "note-card";
    karte.style.backgroundColor = getNoteColor(farbIndex);
    karte.setAttribute("data-note-id", note.id);
 
    var titelEl = document.createElement("h3");
    titelEl.className = "note-card-title";
    titelEl.textContent = note.title;
 
    var vorschau = note.content;
    if (vorschau.length > 120) {
        vorschau = vorschau.substring(0, 120) + "...";
    }
    var inhaltEl = document.createElement("p");
    inhaltEl.className = "note-card-content";
    inhaltEl.textContent = vorschau;
 
    var fusszeileEl = document.createElement("div");
    fusszeileEl.className = "note-card-footer";
 
    var buttonContainer = document.createElement("div");
    buttonContainer.className = "note-card-buttons";
 
    var bearbeitenBtn = document.createElement("button");
    bearbeitenBtn.className = "note-btn edit-btn";
    bearbeitenBtn.title = "Notiz bearbeiten";
    bearbeitenBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>' +
        '<path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
        "</svg>";
 
    var noteId = note.id;
 
    bearbeitenBtn.onclick = function() {
        openEditModal(note);
    };
 
    var loeschenBtn = document.createElement("button");
    loeschenBtn.className = "note-btn delete-btn";
    loeschenBtn.title = "Notiz löschen";
    loeschenBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>' +
        '<path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
        "</svg>";
 
    loeschenBtn.onclick = function() {
        deleteNote(noteId);
    };
 
    buttonContainer.appendChild(bearbeitenBtn);
    buttonContainer.appendChild(loeschenBtn);
    fusszeileEl.appendChild(buttonContainer);
    karte.appendChild(titelEl);
    karte.appendChild(inhaltEl);
    karte.appendChild(fusszeileEl);
 
    return karte;
}
 
 
// Modal
function openCreateModal() {
    selectedNote = null;
    document.getElementById("modalTitle").value = "";
    document.getElementById("modalContent").value = "";
    showModal();
}
 
function openEditModal(note) {
    selectedNote = note;
    document.getElementById("modalTitle").value = note.title;
    document.getElementById("modalContent").value = note.content;
    showModal();
}
 
function saveNote() {
    var titelInput = document.getElementById("modalTitle");
    var inhaltInput = document.getElementById("modalContent");
 
    var titel = titelInput.value.trim();
    var inhalt = inhaltInput.value.trim();
 
    if (titel === "") {
        titelInput.focus();
        return;
    }
 
    if (selectedNote === null) {
        createNote(titel, inhalt);
    } else {
        updateNote(selectedNote.id, titel, inhalt);
    }
 
    closeModal();
}
 
function showModal() {
    var overlay = document.getElementById("modalOverlay");
    overlay.classList.add("active");
    document.getElementById("modalTitle").focus();
}
 
function closeModal() {
    var overlay = document.getElementById("modalOverlay");
    overlay.classList.remove("active");
    selectedNote = null;
}
 
 
// Event Listener
document.getElementById("searchInput").addEventListener("input", function() {
    loadNotes();
});
 
document.getElementById("addNoteBtn").addEventListener("click", function() {
    openCreateModal();
});
 
document.getElementById("saveBtn").addEventListener("click", function() {
    saveNote();
});
 
document.getElementById("cancelBtn").addEventListener("click", function() {
    closeModal();
});
 
document.getElementById("modalOverlay").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal();
    }
});
 
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        var overlay = document.getElementById("modalOverlay");
        if (overlay.classList.contains("active")) {
            closeModal();
        }
    }
});
 
 
// App starten
loadNotes();