// js/script.js
document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');
    const progressContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const nowPlayingTitle = document.getElementById('now-playing-title');
    const nowPlayingArtist = document.getElementById('now-playing-artist');
    const nowPlayingCover = document.getElementById('now-playing-cover');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const navItems = document.querySelectorAll('.sidebar nav ul li');
    const contentSections = document.querySelectorAll('.content-section');

    // Variables de estado
    let currentSongIndex = 0;
    let songs = [];
    let currentPlaylist = [];
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 0.7; // Volumen por defecto

    // Inicializar la aplicación
    init();

    function init() {
        // Cargar datos iniciales
        loadFeaturedSongs();
        loadArtists();
        loadAlbums();
        loadPlaylists();

        // Configurar eventos
        setupEventListeners();

        audioPlayer.volume = lastVolume;
        document.getElementById('volume-slider').value = lastVolume;
    }

    function setupEventListeners() {
        // Navegación
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });

        // Controles del reproductor
        document.getElementById('volume-btn').addEventListener('click', toggleMute);
        document.getElementById('volume-slider').addEventListener('input', updateVolume);
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPreviousSong);
        nextBtn.addEventListener('click', playNextSong);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNextSong);
        progressContainer.addEventListener('click', setProgress);
        searchBtn.addEventListener('click', searchSongs);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') searchSongs();
        });
    }

    function showSection(sectionId) {
        // Actualizar navegación activa
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });

        // Mostrar sección correspondiente
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${sectionId}-section`) {
                section.classList.add('active');
            }
        });

        // Cargar contenido específico si es necesario
        if (sectionId === 'home') {
            loadFeaturedSongs();
        }
    }

    // Funciones para cargar datos desde la base de datos
    async function loadFeaturedSongs() {
        try {
            const response = await fetch('php/api/get_songs.php?limit=6');
            songs = await response.json();
            displaySongsGrid(songs, 'featured-songs');
        } catch (error) {
            console.error('Error al cargar canciones destacadas:', error);
        }
    }

    async function loadArtists() {
        try {
            const response = await fetch('php/api/get_artists.php');
            const artists = await response.json();
            displayArtists(artists);
        } catch (error) {
            console.error('Error al cargar artistas:', error);
        }
    }

    async function loadAlbums() {
        try {
            const response = await fetch('php/api/get_albums.php');
            const albums = await response.json();
            displayAlbums(albums);
        } catch (error) {
            console.error('Error al cargar álbumes:', error);
        }
    }

    async function loadPlaylists() {
        try {
            const response = await fetch('php/api/get_playlists.php');
            const playlists = await response.json();
            displayPlaylists(playlists);
        } catch (error) {
            console.error('Error al cargar listas de reproducción:', error);
        }
    }

    async function loadSongsByArtist(artistId, order = 'titulo') {
        try {
            const response = await fetch(`php/api/get_songs.php?artist_id=${artistId}&order=${order}`);
            songs = await response.json();
            document.getElementById('songs-section-title').textContent = `Canciones del artista (ordenadas por ${getOrderName(order)})`;
            displaySongsList(songs);
            showSection('songs');

            // Añadir controles de ordenación
            addSortingControls(artistId, 'artist');
        } catch (error) {
            console.error('Error al cargar canciones del artista:', error);
        }
    }

    async function loadSongsByAlbum(albumId) {
        try {
            const response = await fetch(`php/api/get_songs.php?album_id=${albumId}`);
            songs = await response.json();
            document.getElementById('songs-section-title').textContent = 'Canciones del álbum';
            displaySongsList(songs);
            showSection('songs');
        } catch (error) {
            console.error('Error al cargar canciones del álbum:', error);
        }
    }

    async function loadSongsByPlaylist(playlistId) {
        try {
            const response = await fetch(`php/api/get_songs.php?playlist_id=${playlistId}`);
            songs = await response.json();
            document.getElementById('songs-section-title').textContent = 'Canciones de la lista';
            displaySongsList(songs);
            showSection('songs');
        } catch (error) {
            console.error('Error al cargar canciones de la lista:', error);
        }
    }

    // Añadir esta función para llenar los selectores
    async function fillPlaylistSelectors() {
        try {
            const response = await fetch('php/api/get_playlists.php');
            const playlists = await response.json();

            document.querySelectorAll('.playlist-selector').forEach(select => {
                // Guardar la opción por defecto
                const defaultOption = select.options[0];
                select.innerHTML = '';
                select.appendChild(defaultOption);

                playlists.forEach(playlist => {
                    const option = document.createElement('option');
                    option.value = playlist.id_lista;
                    option.textContent = playlist.nombre;
                    select.appendChild(option);
                });
            });
        } catch (error) {
            console.error('Error al cargar playlists:', error);
        }
    }

    // Añadir esta función global para añadir canciones a playlists
    window.addSongToPlaylist = async function (songId, playlistId) {
        if (!playlistId) return;

        try {
            const response = await fetch(`php/api/get_songs.php?action=add_to_playlist&playlist_id=${playlistId}&song_id=${songId}`);
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                // Recargar la lista de reproducción si estamos viéndola
                if (currentPlaylist && currentPlaylist.id_lista === playlistId) {
                    loadSongsByPlaylist(playlistId);
                }
            } else {
                console.error('Error:', result.error);
            }
        } catch (error) {
            console.error('Error al agregar canción:', error);
        }
    };


    // Añadir esta función a script.js
    async function loadDeletionLogs() {
        try {
            const response = await fetch('php/api/get_logs.php');
            const logs = await response.json();

            const container = document.getElementById('logs-container');
            if (!container) {
                // Crear contenedor si no existe
                const content = document.querySelector('.content');
                const logsSection = document.createElement('section');
                logsSection.id = 'logs-section';
                logsSection.className = 'content-section';
                logsSection.innerHTML = `
                    <h2>Registro de eliminaciones</h2>
                    <div id="logs-container" class="logs-list"></div>
                `;
                content.appendChild(logsSection);
            }

            displayLogs(logs);
            showSection('logs');
        } catch (error) {
            console.error('Error al cargar logs:', error);
        }
    }

    function displayLogs(logs) {
        const container = document.getElementById('logs-container');
        container.innerHTML = '';

        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <div class="log-date">${new Date(log.fecha_eliminacion).toLocaleString()}</div>
                <div class="log-action">${log.accion}</div>
                <div class="log-details">Lista ID: ${log.id_lista}, Canción ID: ${log.id_cancion}</div>
                <div class="log-user">Usuario: ${log.usuario}</div>
            `;
            container.appendChild(logEntry);
        });
    }


    // Añadir esta función auxiliar
    function getOrderName(order) {
        const orders = {
            'titulo': 'título',
            'album': 'álbum',
            'duracion': 'duración'
        };
        return orders[order] || order;
    }

    // Añadir esta función para los controles de ordenación
    function addSortingControls(id, type) {
        const sectionTitle = document.getElementById('songs-section-title');

        // Eliminar controles existentes si los hay
        const existingControls = document.querySelector('.sorting-controls');
        if (existingControls) {
            existingControls.remove();
        }

        const sortingControls = document.createElement('div');
        sortingControls.className = 'sorting-controls';
        sortingControls.innerHTML = `
            <span>Ordenar por: </span>
            <button onclick="loadSortedSongs('${type}', ${id}, 'titulo')">Título</button>
            <button onclick="loadSortedSongs('${type}', ${id}, 'album')">Álbum</button>
            <button onclick="loadSortedSongs('${type}', ${id}, 'duracion')">Duración</button>
        `;
        sectionTitle.appendChild(sortingControls);
    }

    // Añadir esta función global para manejar la ordenación
    window.loadSortedSongs = function (type, id, order) {
        switch (type) {
            case 'artist':
                loadSongsByArtist(id, order);
                break;
            case 'album':
                loadSongsByAlbum(id, order);
                break;
            case 'playlist':
                loadSongsByPlaylist(id, order);
                break;
            default:
                console.error('Tipo de ordenación no soportado:', type);
        }
    };


    function searchSongs() {
        const query = searchInput.value.trim();
        if (query === '') return;

        fetch(`php/get_songs.php?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                songs = data;
                document.getElementById('songs-section-title').textContent = `Resultados para "${query}"`;
                displaySongsList(songs);
                showSection('songs');
            })
            .catch(error => {
                console.error('Error al buscar canciones:', error);
            });
    }

    // Funciones para mostrar datos en la interfaz
    function displaySongsGrid(songs, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        songs.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';
            songCard.innerHTML = `
                <div class="cover-image">
                    <i class="fas fa-music"></i>
                </div>
                <div class="song-title">${song.titulo}</div>
                <div class="song-artist">${song.artista}</div>
            `;
            songCard.addEventListener('click', () => playSong(index));
            container.appendChild(songCard);
        });
    }

    function displaySongsList(songs) {
        const container = document.getElementById('songs-list');
        container.innerHTML = '';

        songs.forEach((song, index) => {
            const songRow = document.createElement('div');
            songRow.className = 'song-row';
            songRow.innerHTML = `
                <div class="song-row-number">${index + 1}</div>
                <div class="song-row-title">${song.titulo}</div>
                <div class="song-row-artist">${song.artista}</div>
                <div class="song-row-album">${song.album || 'Sin álbum'}</div>
                <div class="song-row-duration">${formatTime(song.duracion)}</div>
                <div class="song-row-actions">
                    <select class="playlist-selector" onchange="addSongToPlaylist(${song.id_cancion}, this.value)">
                        <option value="">Añadir a...</option>
                        <!-- Las opciones se llenarán dinámicamente -->
                    </select>
                </div>
            `;
            songRow.addEventListener('click', (e) => {
                // Evitar que el clic en el select propague al reproductor
                if (!e.target.classList.contains('playlist-selector')) {
                    playSong(index);
                }
            });
            container.appendChild(songRow);
        });

        // Llenar los selectores de playlist
        fillPlaylistSelectors();

        currentPlaylist = songs;
    }

    function displayArtists(artists) {
        const container = document.getElementById('artists-list');
        container.innerHTML = '';

        artists.forEach(artist => {
            const artistCard = document.createElement('div');
            artistCard.className = 'artist-card';
            artistCard.innerHTML = `
                <div class="cover-image">
                    <i class="fas fa-user"></i>
                </div>
                <div class="artist-name">${artist.nombre}</div>
            `;
            artistCard.addEventListener('click', () => loadSongsByArtist(artist.id_artista));
            container.appendChild(artistCard);
        });
    }

    function displayAlbums(albums) {
        const container = document.getElementById('albums-list');
        container.innerHTML = '';

        albums.forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'album-card';
            albumCard.innerHTML = `
                <div class="cover-image">
                    <i class="fas fa-compact-disc"></i>
                </div>
                <div class="album-title">${album.titulo}</div>
                <div class="album-artist">${album.artista}</div>
            `;
            albumCard.addEventListener('click', () => loadSongsByAlbum(album.id_album));
            container.appendChild(albumCard);
        });
    }

    function displayPlaylists(playlists) {
        const container = document.getElementById('playlists-list');
        container.innerHTML = '';

        playlists.forEach(playlist => {
            const playlistCard = document.createElement('div');
            playlistCard.className = 'playlist-card';
            playlistCard.innerHTML = `
                <div class="cover-image">
                    <i class="fas fa-list"></i>
                </div>
                <div class="playlist-name">${playlist.nombre}</div>
                <div class="playlist-description">${playlist.descripcion || 'Sin descripción'}</div>
            `;
            playlistCard.addEventListener('click', () => loadSongsByPlaylist(playlist.id_lista));
            container.appendChild(playlistCard);
        });
    }

    // Funciones del reproductor
    function playSong(index) {
        if (songs.length === 0) return;

        currentSongIndex = index;
        const song = songs[currentSongIndex];

        // Actualizar información de la canción actual
        nowPlayingTitle.textContent = song.titulo;
        nowPlayingArtist.textContent = song.artista;
        nowPlayingCover.src = song.album_cover || 'https://via.placeholder.com/50';

        // Establecer la fuente de audio
        audioPlayer.src = song.url;

        // Mantener el volumen actual
        audioPlayer.volume = document.getElementById('volume-slider').value;

        // Reproducir
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayButton();
            })
            .catch(error => {
                console.error('Error al reproducir:', error);
            });
    }

    function togglePlay() {
        if (audioPlayer.src === '') return;

        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayButton();
    }

    function updatePlayButton() {
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    function playPreviousSong() {
        if (songs.length === 0) return;

        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        playSong(currentSongIndex);
    }

    function playNextSong() {
        if (songs.length === 0) return;

        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
        playSong(currentSongIndex);
    }

    function updateProgress() {
        const { duration, currentTime } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;

        // Actualizar tiempos
        currentTimeEl.textContent = formatTime(currentTime);

        if (!isNaN(duration)) {
            durationEl.textContent = formatTime(duration);
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        if (typeof seconds === 'string') {
            // Si el tiempo ya está en formato HH:MM:SS
            return seconds;
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Añadir estas nuevas funciones:
    function toggleMute() {
        if (isMuted) {
            // Restaurar volumen
            audioPlayer.volume = lastVolume;
            document.getElementById('volume-slider').value = lastVolume;
            updateVolumeIcon(lastVolume);
        } else {
            // Silenciar
            lastVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            document.getElementById('volume-slider').value = 0;
            updateVolumeIcon(0);
        }
        isMuted = !isMuted;
    }

    function updateVolume() {
        const volume = this.value;
        audioPlayer.volume = volume;

        // Actualizar estado de mute
        if (volume > 0) {
            isMuted = false;
            lastVolume = volume;
        }

        updateVolumeIcon(volume);
    }

    function updateVolumeIcon(volume) {
        const volumeBtn = document.getElementById('volume-btn');
        let icon;

        if (volume == 0 || isMuted) {
            icon = 'fa-volume-mute';
        } else if (volume < 0.5) {
            icon = 'fa-volume-down';
        } else {
            icon = 'fa-volume-up';
        }

        volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }
});