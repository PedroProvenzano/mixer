// ===========================================
// Nova Mixer - Complete Audio Mixing App
// With Groups, Solo, Upload, and More
// ===========================================

// Track Configuration
let TRACKS = [
    { id: 'track1', name: 'Ambience', icon: '🌌', file: 'assets/NovaInstrument-ambience.wav', enabled: true, custom: false, groupId: null },
    { id: 'track2', name: 'Arpa', icon: '🎻', file: 'assets/NovaInstrument-arpa.wav', enabled: true, custom: false, groupId: null },
    { id: 'track3', name: 'Bajo', icon: '🎸', file: 'assets/NovaInstrument-bajo.wav', enabled: true, custom: false, groupId: null },
    { id: 'track4', name: 'Leitmotif', icon: '🎹', file: 'assets/NovaInstrument-leimotif.wav', enabled: true, custom: false, groupId: null }
];

let GROUPS = [];

const AVAILABLE_ICONS = ['🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻', '🎤', '🎧', '🎼', '🎨', '⭐', '✨', '🌟', '💫', '🌙', '🌌', '🌊', '🔥', '💎', '🎭', '🎪', '🎬'];

const state = {
    isPlaying: false,
    masterVolume: 100,
    tracks: {},
    audioElements: {},
    currentTheme: 'angel',
    soloTrack: null,
    soloGroup: null,
    trackCounter: 4,
    groupCounter: 0,
    currentIconPickerTarget: null
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Nova Mixer initializing...');
    loadCustomData();
    initializeGroups();
    initializeTracks();
    initializeThemeSelector();
    initializeMasterControls();
    initializeAddButtons();
    initializeHeaderCustomization();
    createIconPickerModal();
    createConfirmModal();
    loadSavedState();
    console.log('Nova Mixer ready!');
});

// ===== GROUPS =====

function initializeGroups() {
    renderGroups();
}

function renderGroups() {
    const container = document.getElementById('groupsContainer');
    const noGroupsMsg = document.getElementById('noGroupsMessage');

    if (!container) {
        console.error('Groups container not found!');
        return;
    }

    container.querySelectorAll('.group-card').forEach(card => card.remove());

    if (GROUPS.length === 0) {
        if (noGroupsMsg) noGroupsMsg.classList.remove('hidden');
    } else {
        if (noGroupsMsg) noGroupsMsg.classList.add('hidden');
        GROUPS.forEach(group => {
            const groupCard = createGroupCard(group);
            container.appendChild(groupCard);
        });
    }
}

function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.id = `group-${group.id}`;

    const tracksInGroup = TRACKS.filter(t => t.groupId === group.id);
    const hasAudioTracks = tracksInGroup.some(t => t.enabled && t.file);

    card.innerHTML = `
        <div class="group-header">
            <div class="group-name-section">
                <span class="group-icon" data-group="${group.id}">${group.icon}</span>
                <input type="text" class="group-name-input" value="${group.name}" data-group="${group.id}" />
            </div>
            <div class="group-controls">
                ${hasAudioTracks ? `
                    <button class="group-play-btn" data-group="${group.id}" title="Play/Pause Group">
                        <svg class="group-play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <svg class="group-pause-icon hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    </button>
                    <button class="group-solo-btn" data-group="${group.id}" title="Solo Group">S</button>
                    <button class="group-mute-btn" data-group="${group.id}" title="Mute Group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    </button>
                ` : ''}
                <button class="group-delete-btn" data-group="${group.id}" title="Delete Group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="group-tracks ${tracksInGroup.length === 0 ? 'empty' : ''}" data-group="${group.id}">
            ${tracksInGroup.length === 0 ? 'No tracks assigned' : ''}
        </div>
    `;

    if (tracksInGroup.length > 0) {
        const tracksContainer = card.querySelector('.group-tracks');
        tracksContainer.innerHTML = '';
        tracksInGroup.forEach(track => {
            const pill = createTrackPill(track, group.id);
            tracksContainer.appendChild(pill);
        });
    }

    attachGroupEventListeners(card, group);
    return card;
}

function createTrackPill(track, groupId) {
    const pill = document.createElement('div');
    pill.className = 'track-pill';
    pill.innerHTML = `
        <span class="track-pill-icon">${track.icon}</span>
        <span>${track.name}</span>
        <button class="track-pill-remove" data-track="${track.id}" data-group="${groupId}">×</button>
    `;

    const removeBtn = pill.querySelector('.track-pill-remove');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeTrackFromGroup(track.id);
    });

    return pill;
}

function attachGroupEventListeners(card, group) {
    // Icon click
    const iconEl = card.querySelector('.group-icon');
    if (iconEl) {
        iconEl.addEventListener('click', () => {
            console.log('Group icon clicked:', group.id);
            openIconPicker('group', group.id);
        });
    }

    // Name editing
    const nameInput = card.querySelector('.group-name-input');
    if (nameInput) {
        nameInput.addEventListener('blur', (e) => updateGroupName(group.id, e.target.value));
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
    }

    // Control buttons
    const playBtn = card.querySelector('.group-play-btn');
    if (playBtn) playBtn.addEventListener('click', () => toggleGroupPlay(group.id));

    const soloBtn = card.querySelector('.group-solo-btn');
    if (soloBtn) soloBtn.addEventListener('click', () => toggleGroupSolo(group.id));

    const muteBtn = card.querySelector('.group-mute-btn');
    if (muteBtn) muteBtn.addEventListener('click', () => toggleGroupMute(group.id));

    // Delete button
    const deleteBtn = card.querySelector('.group-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('Delete group button clicked:', group.id);
            deleteGroup(group.id);
        });
    }
}

function addNewGroup() {
    state.groupCounter++;
    const newGroup = {
        id: `group${state.groupCounter}`,
        name: `Group ${state.groupCounter}`,
        icon: '📁',
        muted: false,
        playing: false
    };

    GROUPS.push(newGroup);
    console.log('New group added:', newGroup);
    renderGroups();
    refreshAllTracks();
    saveCustomData();

    setTimeout(() => {
        const nameInput = document.querySelector(`[data-group="${newGroup.id}"].group-name-input`);
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }, 100);
}

async function deleteGroup(groupId) {
    console.log('deleteGroup called for:', groupId);

    const userConfirmed = await showConfirm('Tracks will remain but be ungrouped.', 'Delete This Group?'); if (!userConfirmed) {
        console.log('Group deletion cancelled');
        return;
    }

    // Unassign tracks
    TRACKS.forEach(track => {
        if (track.groupId === groupId) {
            track.groupId = null;
        }
    });

    // Remove group
    const index = GROUPS.findIndex(g => g.id === groupId);
    if (index !== -1) {
        GROUPS.splice(index, 1);
        console.log('Group deleted, remaining groups:', GROUPS.length);
    }

    // Clear solo if needed
    if (state.soloGroup === groupId) {
        state.soloGroup = null;
    }

    renderGroups();
    refreshAllTracks();
    saveCustomData();
}

function updateGroupName(groupId, newName) {
    const group = GROUPS.find(g => g.id === groupId);
    if (group && newName.trim()) {
        group.name = newName.trim();
        refreshAllTracks(); // Update dropdowns with new name
        saveCustomData();
    }
}

function updateGroupIcon(groupId, newIcon) {
    const group = GROUPS.find(g => g.id === groupId);
    if (group) {
        group.icon = newIcon;
        const iconEl = document.querySelector(`\.group-icon[data-group="${groupId}"]`);
        if (iconEl) iconEl.textContent = newIcon;
        saveCustomData();
    }
}

// Group Controls
function toggleGroupPlay(groupId) {
    const group = GROUPS.find(g => g.id === groupId);
    if (!group) return;

    group.playing = !group.playing;
    const tracksInGroup = TRACKS.filter(t => t.groupId === groupId && t.enabled && t.file);

    tracksInGroup.forEach(track => {
        const audio = state.audioElements[track.id];
        if (!audio) return;

        if (group.playing && !state.tracks[track.id].muted && !group.muted) {
            audio.play().catch(err => console.log('Play error:', err));
            updateTrackStatus(track.id, true); // Update status to Playing
        } else {
            audio.pause();
            updateTrackStatus(track.id, false); // Update status to Ready
        }
    });

    updateGroupPlayButtonState(groupId, group.playing);
    updateGroupCardState(groupId);
}

function toggleGroupSolo(groupId) {
    if (state.soloGroup === groupId) {
        state.soloGroup = null;
        state.soloTrack = null;
        if (state.isPlaying) playAllTracks();
        updateAllGroupSoloStates();
    } else {
        state.soloGroup = groupId;
        state.soloTrack = null;
        const tracksInGroup = TRACKS.filter(t => t.groupId === groupId && t.enabled && t.file);
        Object.values(state.audioElements).forEach(audio => audio.pause());

        if (state.isPlaying) {
            tracksInGroup.forEach(track => {
                const audio = state.audioElements[track.id];
                if (audio && !state.tracks[track.id].muted) {
                    audio.play().catch(err => console.log('Play error:', err));
                    updateTrackStatus(track.id, true); // Update status to Playing
                }
            });
        }
        updateAllGroupSoloStates();
        updateAllTrackSoloStates();
    }
    updateGroupCardState(groupId);
}

function toggleGroupMute(groupId) {
    const group = GROUPS.find(g => g.id === groupId);
    if (!group) return;

    group.muted = !group.muted;
    const tracksInGroup = TRACKS.filter(t => t.groupId === groupId && t.enabled && t.file);

    tracksInGroup.forEach(track => {
        const audio = state.audioElements[track.id];
        if (!audio) return;

        if (group.muted || state.tracks[track.id].muted) {
            audio.pause();
            updateTrackStatus(track.id, false); // Update status to Ready
        } else if ((state.isPlaying || group.playing) &&
            (state.soloGroup === null || state.soloGroup === groupId) &&
            (state.soloTrack === null || state.soloTrack === track.id)) {
            audio.play().catch(err => console.log('Play error:', err));
            updateTrackStatus(track.id, true); // Update status to Playing
        }
    });

    updateGroupMuteButtonState(groupId, group.muted);
    updateGroupCardState(groupId);
}

function updateGroupPlayButtonState(groupId, playing) {
    const btn = document.querySelector(`.group-play-btn[data-group="${groupId}"]`);
    if (btn) {
        const playIcon = btn.querySelector('.group-play-icon');
        const pauseIcon = btn.querySelector('.group-pause-icon');
        if (playing) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            btn.classList.add('active');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            btn.classList.remove('active');
        }
    }
}

function updateGroupMuteButtonState(groupId, muted) {
    const btn = document.querySelector(`.group-mute-btn[data-group="${groupId}"]`);
    if (btn) {
        if (muted) btn.classList.add('active');
        else btn.classList.remove('active');
    }
}

function updateAllGroupSoloStates() {
    GROUPS.forEach(group => {
        const btn = document.querySelector(`.group-solo-btn[data-group="${group.id}"]`);
        if (btn) {
            if (state.soloGroup === group.id) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
}

function updateGroupCardState(groupId) {
    const card = document.getElementById(`group-${groupId}`);
    const group = GROUPS.find(g => g.id === groupId);
    if (!card || !group) return;

    if (group.playing) card.classList.add('playing');
    else card.classList.remove('playing');

    if (state.soloGroup === groupId) card.classList.add('soloed');
    else card.classList.remove('soloed');
}

// Track-Group Assignment
function assignTrackToGroup(trackId, groupId) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    if (track.groupId) removeTrackFromGroup(trackId, false);
    track.groupId = groupId || null;

    renderGroups();
    refreshTrackCard(trackId);
    saveCustomData();
}

function removeTrackFromGroup(trackId, shouldSave = true) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    track.groupId = null;
    renderGroups();
    refreshTrackCard(trackId);
    if (shouldSave) saveCustomData();
}

// ===== TRACKS =====

function initializeTracks() {
    const trackMixer = document.getElementById('trackMixer');
    if (!trackMixer) {
        console.error('Track mixer not found!');
        return;
    }

    trackMixer.innerHTML = '';

    TRACKS.forEach(track => {
        if (!state.tracks[track.id]) {
            state.tracks[track.id] = { volume: 100, muted: false, enabled: track.enabled };
        }

        if (track.file && track.enabled && !state.audioElements[track.id]) {
            const audio = new Audio(track.file);
            audio.loop = true;
            audio.volume = 1;
            state.audioElements[track.id] = audio;
        }

        const trackCard = createTrackCard(track);
        trackMixer.appendChild(trackCard);
    });
}

function createTrackCard(track) {
    const card = document.createElement('div');
    card.className = `track-card ${!track.enabled && !track.file ? 'empty' : ''}`;
    card.id = track.id;

    const hasAudio = track.file && track.enabled;
    const canDelete = track.custom;

    const groupOptions = GROUPS.map(g =>
        `<option value="${g.id}" ${track.groupId === g.id ? 'selected' : ''}>${g.icon} ${g.name}</option>`
    ).join('');

    card.innerHTML = `
        <div class="track-header">
            <div class="track-name">
                <span class="track-icon" data-track="${track.id}">${track.icon}</span>
                <input type="text" class="track-name-input" value="${track.name}" data-track="${track.id}" />
                ${track.groupId ? `<span class="track-group-badge">${GROUPS.find(g => g.id === track.groupId)?.icon || '📁'}</span>` : ''}
            </div>
            <div class="track-controls">
                ${hasAudio ? `
                    <button class="solo-btn" data-track="${track.id}">S</button>
                    <button class="track-toggle" data-track="${track.id}">
                        <svg class="volume-on-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <svg class="volume-off-icon hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    </button>
                ` : ''}
                ${canDelete ? `
                    <button class="delete-btn" data-track="${track.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
        
        <div class="track-group-assignment">
            <label class="group-select-label" for="${track.id}-group">Assign to Group:</label>
            <select class="group-select" id="${track.id}-group" data-track="${track.id}">
                <option value="">No Group</option>
                ${groupOptions}
            </select>
        </div>
        
        <div class="track-status" data-status="${track.id}">
            ${hasAudio ? 'Ready' : 'No audio file'}
        </div>
        
        ${hasAudio ? `
            <div class="volume-control">
                <div class="volume-header">
                    <label for="${track.id}-volume">Volume</label>
                    <span class="volume-value" id="${track.id}-value">100%</span>
                </div>
                <input type="range" id="${track.id}-volume" class="volume-slider" min="0" max="100" value="100">
                <div class="volume-bar">
                    <div class="volume-fill" id="${track.id}-fill" style="width: 100%"></div>
                </div>
            </div>
        ` : `
            <div class="upload-section" data-track="${track.id}">
                <div class="upload-icon">📁</div>
                <div class="upload-text">
                    <strong>Click to upload</strong> or drag and drop<br>
                    <small>MP3, WAV, OGG, M4A</small>
                </div>
                <input type="file" class="file-input" accept="audio/*" data-track="${track.id}">
            </div>
        `}
    `;

    attachTrackEventListeners(card, track);
    return card;
}

function attachTrackEventListeners(card, track) {
    const hasAudio = track.file && track.enabled;

    // Icon click
    const iconEl = card.querySelector('.track-icon');
    if (iconEl) {
        iconEl.addEventListener('click', () => {
            console.log('Track icon clicked:', track.id);
            openIconPicker('track', track.id);
        });
    }

    // Name editing
    const nameInput = card.querySelector('.track-name-input');
    if (nameInput) {
        nameInput.addEventListener('blur', (e) => updateTrackName(track.id, e.target.value));
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
    }

    // Group assignment
    const groupSelect = card.querySelector('.group-select');
    if (groupSelect) {
        groupSelect.addEventListener('change', (e) => {
            assignTrackToGroup(track.id, e.target.value);
        });
    }

    if (hasAudio) {
        const slider = card.querySelector(`#${track.id}-volume`);
        if (slider) slider.addEventListener('input', (e) => handleTrackVolume(track.id, e.target.value));

        const toggleBtn = card.querySelector('.track-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', () => toggleTrackMute(track.id));

        const soloBtn = card.querySelector('.solo-btn');
        if (soloBtn) soloBtn.addEventListener('click', () => toggleSolo(track.id));
    } else {
        const uploadSection = card.querySelector('.upload-section');
        const fileInput = card.querySelector('.file-input');

        if (uploadSection && fileInput) {
            uploadSection.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => handleFileUpload(track.id, e.target.files[0]));

            uploadSection.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadSection.classList.add('dragover');
            });

            uploadSection.addEventListener('dragleave', () => {
                uploadSection.classList.remove('dragover');
            });

            uploadSection.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadSection.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('audio/')) {
                    handleFileUpload(track.id, file);
                }
            });
        }
    }

    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('Delete track button clicked:', track.id);
            deleteTrack(track.id);
        });
    }
}

function refreshTrackCard(trackId) {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    const oldCard = document.getElementById(trackId);
    if (!oldCard) return;

    const newCard = createTrackCard(track);
    oldCard.replaceWith(newCard);

    if (track.enabled && track.file) {
        const slider = newCard.querySelector(`#${trackId}-volume`);
        if (slider && state.tracks[trackId]) {
            slider.value = state.tracks[trackId].volume;
            handleTrackVolume(trackId, state.tracks[trackId].volume);
        }
    }
}

function refreshAllTracks() {
    TRACKS.forEach(track => refreshTrackCard(track.id));
}

function toggleSolo(trackId) {
    if (state.soloTrack === trackId) {
        state.soloTrack = null;
        if (state.isPlaying) playAllTracks();
        updateAllTrackSoloStates();
    } else {
        state.soloTrack = trackId;
        state.soloGroup = null;

        Object.keys(state.audioElements).forEach(id => {
            const audio = state.audioElements[id];
            if (id === trackId) {
                if (state.isPlaying && !state.tracks[id].muted) {
                    audio.play().catch(err => console.log('Play error:', err));
                    updateTrackStatus(track.id, true); // Update status to Playing
                }
            } else {
                audio.pause();
                updateTrackStatus(track.id, false); // Update status to Ready
            }
        });

        updateAllTrackSoloStates();
        updateAllGroupSoloStates();
    }

    updateTrackCardSoloState(trackId, state.soloTrack === trackId);
}

function updateAllTrackSoloStates() {
    Object.keys(state.audioElements).forEach(trackId => {
        const btn = document.querySelector(`.solo-btn[data-track="${trackId}"]`);
        if (btn) {
            if (state.soloTrack === trackId) btn.classList.add('active');
            else btn.classList.remove('active');
        }
        updateTrackCardSoloState(trackId, state.soloTrack === trackId);
    });
}

function updateTrackCardSoloState(trackId, soloed) {
    const card = document.getElementById(trackId);
    if (card) {
        if (soloed) card.classList.add('soloed');
        else card.classList.remove('soloed');
    }
}

function handleFileUpload(trackId, file) {
    if (!file || !file.type.startsWith('audio/')) {
        alert('Please select a valid audio file');
        return;
    }

    const url = URL.createObjectURL(file);
    const track = TRACKS.find(t => t.id === trackId);

    if (track) {
        track.file = url;
        track.enabled = true;

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = (state.masterVolume / 100) * (state.tracks[trackId].volume / 100);
        state.audioElements[trackId] = audio;
        state.tracks[trackId].enabled = true;

        refreshTrackCard(trackId);
        renderGroups();
        saveCustomData();
    }
}

function updateTrackName(trackId, newName) {
    const track = TRACKS.find(t => t.id === trackId);
    if (track && newName.trim()) {
        track.name = newName.trim();
        if (track.groupId) renderGroups();
        saveCustomData();
    }
}

function updateTrackIcon(trackId, newIcon) {
    const track = TRACKS.find(t => t.id === trackId);
    if (track) {
        track.icon = newIcon;
        const iconEl = document.querySelector(`.track-icon[data-track="${trackId}"]`);
        if (iconEl) iconEl.textContent = newIcon;
        if (track.groupId) renderGroups();
        saveCustomData();
    }
}

function addNewTrack() {
    state.trackCounter++;
    const newTrack = {
        id: `track${state.trackCounter}`,
        name: `Track ${state.trackCounter}`,
        icon: '🎵',
        file: null,
        enabled: false,
        custom: true,
        groupId: null
    };

    TRACKS.push(newTrack);
    state.tracks[newTrack.id] = { volume: 100, muted: false, enabled: false };

    const trackMixer = document.getElementById('trackMixer');
    const newCard = createTrackCard(newTrack);
    trackMixer.appendChild(newCard);

    const nameInput = newCard.querySelector('.track-name-input');
    if (nameInput) {
        nameInput.focus();
        nameInput.select();
    }

    saveCustomData();
}

async function deleteTrack(trackId) {
    console.log('deleteTrack called for:', trackId);

    const userConfirmed = await showConfirm('Audio file will not be deleted.', 'Delete This Track?'); if (!userConfirmed) {
        console.log('Track deletion cancelled');
        return;
    }

    const index = TRACKS.findIndex(t => t.id === trackId);
    if (index !== -1) {
        TRACKS.splice(index, 1);
        console.log('Track deleted');
    }

    if (state.audioElements[trackId]) {
        state.audioElements[trackId].pause();
        delete state.audioElements[trackId];
    }

    delete state.tracks[trackId];

    const card = document.getElementById(trackId);
    if (card) card.remove();

    renderGroups();
    saveCustomData();
}

// ===== ICON PICKER =====

function openIconPicker(type, id) {
    console.log('Opening icon picker for:', type, id);
    state.currentIconPickerTarget = { type, id };
    const modal = document.getElementById('iconPickerModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('Icon picker modal not found!');
    }
}

function createIconPickerModal() {
    const modal = document.createElement('div');
    modal.id = 'iconPickerModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="icon-picker-modal">
            <div class="modal-header">
                <h3>Choose an Icon</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="icon-grid">
                ${AVAILABLE_ICONS.map(icon => `<button class="icon-option" data-icon="${icon}">${icon}</button>`).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    console.log('Icon picker modal created');

    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    const iconOptions = modal.querySelectorAll('.icon-option');
    iconOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const icon = btn.dataset.icon;
            console.log('Icon selected:', icon);

            if (state.currentIconPickerTarget) {
                const { type, id } = state.currentIconPickerTarget;
                if (type === 'track') {
                    updateTrackIcon(id, icon);
                } else if (type === 'group') {
                    updateGroupIcon(id, icon);
                }
                modal.classList.remove('active');
            }
        });
    });
}


// ===== CUSTOM CONFIRM MODAL =====

function createConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `<div class="confirm-modal"><h3 id="confirmTitle">Confirm Action</h3><p id="confirmMessage">Are you sure?</p><div class="confirm-modal-buttons"><button class="confirm-btn confirm-btn-cancel" id="confirmCancel">Cancel</button><button class="confirm-btn confirm-btn-confirm" id="confirmOk">Delete</button></div></div>`;
    document.body.appendChild(modal);
    console.log('Custom confirm modal created');
}

async function showConfirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const cancelBtn = document.getElementById('confirmCancel');
        const okBtn = document.getElementById('confirmOk');
        if (!modal) { console.error('Confirm modal not found!'); resolve(false); return; }
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('active');
        const handleCancel = () => {
            modal.classList.remove('active');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
            console.log('User clicked Cancel');
            resolve(false);
        };
        const handleOk = () => {
            modal.classList.remove('active');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
            console.log('User clicked OK');
            resolve(true);
        };
        cancelBtn.addEventListener('click', handleCancel);
        okBtn.addEventListener('click', handleOk);
        modal.addEventListener('click', (e) => { if (e.target === modal) handleCancel(); }, { once: true });
    });
}

// ===== HEADER CUSTOMIZATION =====

function initializeHeaderCustomization() {
    loadHeaderCustomization();

    // Profile image upload
    const profileContainer = document.getElementById('profileImageContainer');
    const profileUploadBtn = document.getElementById('profileUploadBtn');
    const profileInput = document.getElementById('profileImageInput');

    if (profileContainer && profileInput) {
        profileContainer.addEventListener('click', () => profileInput.click());
        profileUploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileInput.click();
        });
        profileInput.addEventListener('change', handleProfileImageUpload);
    }

    // Title editing
    const editTitleBtn = document.getElementById('editTitleBtn');
    const appTitle = document.getElementById('appTitle');

    if (editTitleBtn && appTitle) {
        editTitleBtn.addEventListener('click', () => editAppTitle());
    }
}

function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageUrl = e.target.result;
        setProfileImage(imageUrl);
        saveHeaderCustomization();
    };
    reader.readAsDataURL(file);
}

function setProfileImage(imageUrl) {
    const profileImage = document.getElementById('profileImage');
    const profilePlaceholder = document.getElementById('profilePlaceholder');

    if (profileImage && profilePlaceholder) {
        profileImage.src = imageUrl;
        profileImage.classList.remove('hidden');
        profilePlaceholder.style.display = 'none';
    }
}

async function editAppTitle() {
    const appTitle = document.getElementById('appTitle');
    const currentTitle = appTitle.textContent;

    // Create temporary input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'app-title-edit';
    input.style.cssText = `
        font-size: inherit;
        font-weight: inherit;
        background: var(--bg-secondary);
        border: 2px solid var(--primary);
        border-radius: var(--radius-md);
        padding: 4px 8px;
        color: inherit;
        min-width: 200px;
    `;

    appTitle.replaceWith(input);
    input.focus();
    input.select();

    const saveTitle = () => {
        const newTitle = input.value.trim() || 'Nova Mixer';
        const newSpan = document.createElement('span');
        newSpan.id = 'appTitle';
        newSpan.className = 'app-title';
        newSpan.textContent = newTitle;
        input.replaceWith(newSpan);
        saveHeaderCustomization();
    };

    input.addEventListener('blur', saveTitle);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveTitle();
    });
}

function saveHeaderCustomization() {
    const appTitle = document.getElementById('appTitle');
    const profileImage = document.getElementById('profileImage');

    const customization = {
        title: appTitle ? appTitle.textContent : 'Nova Mixer',
        profileImage: profileImage && !profileImage.classList.contains('hidden') ? profileImage.src : null
    };

    localStorage.setItem('novaMixerHeader', JSON.stringify(customization));
}

function loadHeaderCustomization() {
    const saved = localStorage.getItem('novaMixerHeader');
    if (saved) {
        try {
            const customization = JSON.parse(saved);

            if (customization.title) {
                const appTitle = document.getElementById('appTitle');
                if (appTitle) appTitle.textContent = customization.title;
            }

            if (customization.profileImage) {
                setProfileImage(customization.profileImage);
            }
        } catch (err) {
            console.error('Error loading header customization:', err);
        }
    }
}
// ===== MASTER CONTROLS =====

function initializeMasterControls() {
    const playBtn = document.getElementById('masterPlayBtn');
    const masterVolume = document.getElementById('masterVolume');

    if (playBtn) playBtn.addEventListener('click', togglePlayPause);
    if (masterVolume) masterVolume.addEventListener('input', (e) => handleMasterVolume(e.target.value));
}

function togglePlayPause() {
    state.isPlaying = !state.isPlaying;

    const playBtn = document.getElementById('masterPlayBtn');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');

    if (state.isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        playBtn.classList.add('playing');
        playAllTracks();
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        playBtn.classList.remove('playing');
        pauseAllTracks();
    }
}

function playAllTracks() {
    Object.entries(state.audioElements).forEach(([trackId, audio]) => {
        const track = TRACKS.find(t => t.id === trackId);
        const group = track?.groupId ? GROUPS.find(g => g.id === track.groupId) : null;

        const shouldPlay = !state.tracks[trackId].muted &&
            (!group || !group.muted) &&
            (state.soloTrack === null || state.soloTrack === trackId) &&
            (state.soloGroup === null || state.soloGroup === track?.groupId);

        if (shouldPlay) {
            audio.play().catch(err => console.log('Play error:', err));
            updateTrackStatus(track.id, true); // Update status to Playing
        }
        updateTrackStatus(trackId, shouldPlay);
    });
}

function pauseAllTracks() {
    Object.values(state.audioElements).forEach(audio => audio.pause());
    Object.keys(state.audioElements).forEach(trackId => updateTrackStatus(trackId, false));
}

function handleMasterVolume(value) {
    state.masterVolume = parseInt(value);
    document.getElementById('masterVolumeValue').textContent = `${value}%`;
    document.getElementById('masterVolumeFill').style.width = `${value}%`;
    updateAllTrackVolumes();
    saveState();
}

function handleTrackVolume(trackId, value) {
    state.tracks[trackId].volume = parseInt(value);
    document.getElementById(`${trackId}-value`).textContent = `${value}%`;
    document.getElementById(`${trackId}-fill`).style.width = `${value}%`;

    if (state.audioElements[trackId]) {
        const masterVol = state.masterVolume / 100;
        const trackVol = state.tracks[trackId].volume / 100;
        state.audioElements[trackId].volume = masterVol * trackVol;
    }

    saveState();
}

function toggleTrackMute(trackId) {
    const track = state.tracks[trackId];
    track.muted = !track.muted;

    const card = document.getElementById(trackId);
    const toggleBtn = card.querySelector('.track-toggle');
    const volumeOnIcon = toggleBtn.querySelector('.volume-on-icon');
    const volumeOffIcon = toggleBtn.querySelector('.volume-off-icon');

    if (track.muted) {
        volumeOnIcon.classList.add('hidden');
        volumeOffIcon.classList.remove('hidden');
        toggleBtn.classList.add('muted');

        if (state.audioElements[trackId]) {
            state.audioElements[trackId].pause();
        }
    } else {
        volumeOnIcon.classList.remove('hidden');
        volumeOffIcon.classList.add('hidden');
        toggleBtn.classList.remove('muted');

        const trackData = TRACKS.find(t => t.id === trackId);
        const group = trackData?.groupId ? GROUPS.find(g => g.id === trackData.groupId) : null;

        const shouldPlay = state.isPlaying &&
            (!group || !group.muted) &&
            (state.soloTrack === null || state.soloTrack === trackId) &&
            (state.soloGroup === null || state.soloGroup === trackData?.groupId);

        if (shouldPlay && state.audioElements[trackId]) {
            state.audioElements[trackId].play().catch(err => console.log('Play error:', err));
        }
    }

    updateTrackStatus(trackId, !track.muted && state.isPlaying);
    saveState();
}

function updateAllTrackVolumes() {
    Object.entries(state.audioElements).forEach(([trackId, audio]) => {
        const masterVol = state.masterVolume / 100;
        const trackVol = state.tracks[trackId].volume / 100;
        audio.volume = masterVol * trackVol;
    });
}

function updateTrackStatus(trackId, isPlaying) {
    const statusEl = document.querySelector(`[data-status="${trackId}"]`);
    const card = document.getElementById(trackId);

    if (statusEl && card) {
        if (isPlaying) {
            statusEl.textContent = 'Playing...';
            statusEl.classList.add('playing');
            card.classList.add('playing');
        } else {
            statusEl.textContent = 'Ready';
            statusEl.classList.remove('playing');
            card.classList.remove('playing');
        }
    }
}

// ===== THEME =====

function initializeThemeSelector() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
}

function setTheme(theme) {
    state.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === theme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    saveState();
}

// ===== ADD BUTTONS =====

function initializeAddButtons() {
    const addTrackBtn = document.getElementById('addTrackBtn');
    const addGroupBtn = document.getElementById('addGroupBtn');

    if (addTrackBtn) addTrackBtn.addEventListener('click', addNewTrack);
    if (addGroupBtn) addGroupBtn.addEventListener('click', addNewGroup);
}

// ===== STATE PERSISTENCE =====

function saveState() {
    const savedState = {
        masterVolume: state.masterVolume,
        tracks: state.tracks,
        theme: state.currentTheme
    };
    localStorage.setItem('novaMixerState', JSON.stringify(savedState));
}

function loadSavedState() {
    const saved = localStorage.getItem('novaMixerState');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);

            if (savedState.masterVolume !== undefined) {
                document.getElementById('masterVolume').value = savedState.masterVolume;
                handleMasterVolume(savedState.masterVolume);
            }

            if (savedState.tracks) {
                Object.entries(savedState.tracks).forEach(([trackId, trackData]) => {
                    if (state.tracks[trackId]) {
                        state.tracks[trackId] = { ...state.tracks[trackId], ...trackData };
                        const slider = document.getElementById(`${trackId}-volume`);
                        if (slider) {
                            slider.value = trackData.volume;
                            handleTrackVolume(trackId, trackData.volume);
                        }
                    }
                });
            }

            if (savedState.theme) setTheme(savedState.theme);
        } catch (err) {
            console.error('Error loading state:', err);
        }
    }
}

function saveCustomData() {
    const customTracks = TRACKS.filter(t => t.custom).map(t => ({
        id: t.id, name: t.name, icon: t.icon, custom: t.custom, groupId: t.groupId
    }));

    const editedTracks = TRACKS.filter(t => !t.custom).map(t => ({
        id: t.id, name: t.name, icon: t.icon, groupId: t.groupId
    }));

    const customData = {
        tracks: { custom: customTracks, edited: editedTracks, counter: state.trackCounter },
        groups: { all: GROUPS, counter: state.groupCounter }
    };

    localStorage.setItem('novaMixerCustomData', JSON.stringify(customData));
}

function loadCustomData() {
    const saved = localStorage.getItem('novaMixerCustomData');
    if (saved) {
        try {
            const customData = JSON.parse(saved);

            if (customData.tracks?.edited) {
                customData.tracks.edited.forEach(savedTrack => {
                    const track = TRACKS.find(t => t.id === savedTrack.id);
                    if (track) {
                        track.name = savedTrack.name;
                        track.icon = savedTrack.icon;
                        track.groupId = savedTrack.groupId || null;
                    }
                });
            }

            if (customData.tracks?.custom && customData.tracks.custom.length > 0) {
                customData.tracks.custom.forEach(customTrack => {
                    if (!TRACKS.find(t => t.id === customTrack.id)) {
                        TRACKS.push({ ...customTrack, file: null, enabled: false });
                    }
                });
            }

            if (customData.tracks?.counter) state.trackCounter = customData.tracks.counter;
            if (customData.groups?.all) GROUPS = customData.groups.all;
            if (customData.groups?.counter) state.groupCounter = customData.groups.counter;
        } catch (err) {
            console.error('Error loading custom data:', err);
        }
    }
}









