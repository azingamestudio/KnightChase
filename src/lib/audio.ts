let sfxVolume = 0.05;
let musicVolume = 0.0;
let _sfxVolumeBeforeMute = 0.05; // Store volume before mute
let _musicVolumeBeforeMute = 0.05; // Store volume before mute
let isMuted = false; // Global mute state

const sfxCache: {[key: string]: HTMLAudioElement} = {};
const musicCache: {[key: string]: HTMLAudioElement} = {};

export const playSFX = (filename: string) => {
    if (sfxVolume === 0 || isMuted) return; // Check isMuted as well
    if (!sfxCache[filename]) {
        sfxCache[filename] = new Audio(`/${filename}`);
    }
    sfxCache[filename].volume = sfxVolume;
    sfxCache[filename].play();
};

export const playMusic = (filename: string, loop: boolean = true) => {
    if (isMuted) return; // If globally muted, do not play

    let audio = musicCache[filename];
    if (!audio) {
        audio = new Audio(`/${filename}`);
        musicCache[filename] = audio;
        audio.loop = loop;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = musicVolume;
    audio.play();
};

export const stopMusic = (filename: string) => {
    if (musicCache[filename]) {
        musicCache[filename].pause();
        musicCache[filename].currentTime = 0;
    }
};

export const setSFXVolume = (volume: number) => {
    sfxVolume = volume;
    if (!isMuted) { // Only update _sfxVolumeBeforeMute if not currently muted
        _sfxVolumeBeforeMute = volume;
    }
    for (const key in sfxCache) {
        sfxCache[key].volume = sfxVolume;
    }
};

export const setMusicVolume = (volume: number) => {
    musicVolume = volume;
    if (!isMuted) { // Only update _musicVolumeBeforeMute if not currently muted
        _musicVolumeBeforeMute = volume;
    }
    for (const key in musicCache) {
        musicCache[key].volume = musicVolume;
    }
};

export const toggleMute = () => {
    if (isMuted) {
        // Unmute
        sfxVolume = _sfxVolumeBeforeMute;
        musicVolume = _musicVolumeBeforeMute;
        isMuted = false;

        // Apply new volumes and resume music
        for (const key in sfxCache) {
            sfxCache[key].volume = sfxVolume;
        }
        for (const key in musicCache) {
            musicCache[key].volume = musicVolume;
            if (key.includes('sfx_bg.mp3')) { // Assuming sfx_bg.mp3 is the only continuous music
                musicCache[key].play();
            }
        }
    } else {
        // Mute
        _sfxVolumeBeforeMute = sfxVolume;
        _musicVolumeBeforeMute = musicVolume;
        sfxVolume = 0;
        musicVolume = 0;
        isMuted = true;

        // Apply new volumes and pause all music
        for (const key in sfxCache) {
            sfxCache[key].volume = sfxVolume;
        }
        for (const key in musicCache) {
            musicCache[key].volume = musicVolume;
            musicCache[key].pause();
        }
    }
};

export const getIsMuted = () => isMuted;
