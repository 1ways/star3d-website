import { beats } from './data.js'

// Global variables
let currentBeatIndex = 0
const currentAudio = new Audio(beats[currentBeatIndex].audio)
let isPaused = true

// Create and render default audio
function renderDefaultAudio() {
    const audioTag = document.createElement('audio')
    audioTag.classList.add('current-audio')
    audioTag.id = 'current-audio'
    audioTag.src = `${beats[0].audio}`

    const audioContainer = document.querySelector('.audio')
    audioContainer.appendChild(audioTag)
}

renderDefaultAudio()

// Render Main Beat Logic
function renderMainBeatInfo(beat) {
    currentAudio.src = beat.audio

    // Render beat cover
    const beatCover = document.querySelector('.beat__info-cover-img')
    beatCover.src = beat.cover

    // Render beat title
    const beatTitle = document.querySelector('.beat__info-title')
    beatTitle.textContent = beat.title

    // Render beat bpm and key
    const beatBpmKey = document.querySelector('.beat__info-bpm')
    beatBpmKey.textContent = `${beat.bpm}bpm ${beat.key}`

    // Render beat download link
    const beatDownloadBtn = document.getElementById('beat-download-btn')
    beatDownloadBtn.href = beat.link

    // Render beat info genres
    const genresList = document.getElementById('beat-info-genres')
    genresList.innerHTML = getGenres(beat.genres)
}

// Render first beat by default
renderMainBeatInfo(beats[0])

// Render default beat info inside beat fixed
const fixedBeatEl = document.querySelector('.beat-fixed')

function renderBeatFixedInfo(beat) {
    // change cover
    const beatFixedImage = document.querySelector('.beat-fixed__img')
    beatFixedImage.src = beat.cover
    // change title
    const beatFixedTitle = document.querySelector('.beat-fixed__title')
    beatFixedTitle.textContent = beat.title
    // change download link
    const beatFixedLink = document.getElementById('beat-fixed-download')
    beatFixedLink.href = beat.link
}

renderBeatFixedInfo(beats[0])

// Render waveform and bars
const waveformContainer = document.getElementById('beat-waveform')
const totalBars = 155

function renderWaveformBars() {
    const fragment = document.createDocumentFragment()

    for (let i = 0; i < totalBars; i++) {
        const barContainer = document.createElement('div')
        barContainer.classList.add('beat__waveform-bar-container')

        const bar = document.createElement('div')
        bar.classList.add('beat__waveform-bar')

        barContainer.appendChild(bar)
        fragment.appendChild(barContainer)
    }

    waveformContainer.appendChild(fragment)
}

renderWaveformBars()

// Bars Animation Logic
const barsItems = document.querySelectorAll('.beat__waveform-bar')

function renderBarsAnimation(audio) {
    barsItems.forEach((bar) => {
        const randomBarHeight = Math.floor(Math.random() * (46 - 27 + 1)) + 27
        bar.style.height = `${randomBarHeight}px`
    })

    if (!isPaused && !audio.ended) {
        setTimeout(
            () =>
                requestAnimationFrame(() => renderBarsAnimation(currentAudio)),
            100
        )
    }
}

// Render bars animation when page loads
renderBarsAnimation(currentAudio)

// Update audio time, waveform animations, waveform progress and toggle play buttons by clicking play buttons
const beatPlayBtn = document.getElementById('beat-play-btn')
const beatFixedPlayBtn = document.querySelector('.beat-fixed__play')

const beatPlayIcon = document.getElementById('play-icon')
const beatPauseIcon = document.getElementById('pause-icon')

const beatFixedPlayIcon = document.querySelector('.beat-fixed__play-icon')
const beatFixedPauseIcon = document.querySelector('.beat-fixed__pause-icon')

beatPlayBtn.addEventListener('click', updateAudio)
beatFixedPlayBtn.addEventListener('click', updateAudio)

function updateAudio() {
    if (isPaused) {
        currentAudio.play()
        isPaused = false

        requestAnimationFrame(() => updateAudioCurrentTime(currentAudio))
        requestAnimationFrame(() => renderBarsAnimation(currentAudio))
        requestAnimationFrame(() => renderAudioProgress(currentAudio))
    } else {
        currentAudio.pause()
        isPaused = true
    }

    togglePlayAndPauseIcons(
        beatPlayIcon,
        beatPauseIcon,
        beatFixedPlayIcon,
        beatFixedPauseIcon
    )
    animateStars()
}

function togglePlayAndPauseIcons(
    playIcon,
    pauseIcon,
    playFixedIcon,
    pauseFixedIcon
) {
    playIcon.style.display = isPaused ? 'block' : 'none'
    pauseIcon.style.display = isPaused ? 'none' : 'block'

    playFixedIcon.style.display = isPaused ? 'block' : 'none'
    pauseFixedIcon.style.display = isPaused ? 'none' : 'block'
}

// Render Audio Progress
function renderAudioProgress(audio) {
    const currentBarIndex = Math.floor(
        (audio.currentTime / audio.duration) * totalBars
    )

    barsItems.forEach((bar, index) => {
        bar.classList.toggle('active', index <= currentBarIndex)
    })

    if (!isPaused && !audio.ended) {
        requestAnimationFrame(() => renderAudioProgress(currentAudio))
    }

    if (audio.ended) {
        barsItems.forEach((bar) => {
            bar.classList.remove('active')
        })
    }

    if (audio.currentTime === 0) {
        barsItems.forEach((bar) => {
            bar.classList.remove('active')
        })
    }
}

// Update Audio Time in Beat Info Section
const timeEl = document.getElementById('beat-info-time')

function updateAudioCurrentTime(audio) {
    const update = () => {
        if (audio.ended) {
            timeEl.textContent = '00:00'
            isPaused = true
            togglePlayAndPauseIcons(
                beatPlayIcon,
                beatPauseIcon,
                beatFixedPlayIcon,
                beatFixedPauseIcon
            )
            return
        }

        let mins = Math.floor(audio.currentTime / 60)
        let seconds = Math.floor(audio.currentTime % 60)

        if (seconds < 10 && mins < 10) {
            timeEl.textContent = `0${mins}:0${seconds}`
        } else if (seconds >= 10 && mins < 10) {
            timeEl.textContent = `0${mins}:${seconds}`
        } else {
            timeEl.textContent = `${mins}:${seconds}`
        }
        requestAnimationFrame(update)
    }
    update()
}

// Change Audio time by clicking the bar
function changeAudioTime(audio, index) {
    audio.currentTime = (index / totalBars) * audio.duration

    barsItems.forEach((bar) => {
        bar.classList.remove('active')
    })

    if (audio.paused) {
        audio.play()
        isPaused = false
        requestAnimationFrame(() => renderBarsAnimation(currentAudio))
        togglePlayAndPauseIcons(
            beatPlayIcon,
            beatPauseIcon,
            beatFixedPlayIcon,
            beatFixedPauseIcon
        )
        animateStars()
    }

    requestAnimationFrame(() => updateAudioCurrentTime(currentAudio))
    requestAnimationFrame(() => renderAudioProgress(currentAudio))
}

waveformContainer.addEventListener('click', (e) => {
    const bar = e.target.closest('.beat__waveform-bar-container')

    if (!bar) return

    const index = [...bar.parentElement.children].indexOf(bar)

    changeAudioTime(currentAudio, index)
})

// Update fixed beat progress bar when audio is playing
const currentFixedProgressBar = document.querySelector(
    '.beat-fixed__progress-current'
)

function updateFixedProgressBar() {
    const percentage = (currentAudio.currentTime / currentAudio.duration) * 100

    currentFixedProgressBar.style.width = `${percentage}%`

    if (currentAudio.ended) {
        currentFixedProgressBar.style.width = '0%'
        currentAudio.currentTime = '0'
    }
    if (!currentAudio.paused && !currentAudio.ended) {
        requestAnimationFrame(updateFixedProgressBar)
    }
}

// Change Fixed Progress bar by clicking on it
const beatFixedProgressBar = document.querySelector('.beat-fixed__progress')

beatFixedProgressBar.addEventListener('click', (e) => {
    const progressBarWidth = beatFixedProgressBar.clientWidth

    // get click position
    const clickX = e.offsetX

    // Change audio current time and play it if paused
    if (currentAudio.paused) {
        currentAudio.play()
        isPaused = false
        requestAnimationFrame(() => renderBarsAnimation(currentAudio))
        togglePlayAndPauseIcons(
            beatPlayIcon,
            beatPauseIcon,
            beatFixedPlayIcon,
            beatFixedPauseIcon
        )
        animateStars()
        requestAnimationFrame(() => renderAudioProgress(currentAudio))
    }
    const percentage = Math.floor((clickX / progressBarWidth) * 100)
    currentAudio.currentTime = (percentage / 100) * currentAudio.duration
})

// Show fixed beat, update fixed beat progress bar and set padding when audio starts play
currentAudio.addEventListener('play', () => {
    fixedBeatEl.style.transform = `translateY(0)`

    // Update fixed progress bar
    requestAnimationFrame(updateFixedProgressBar)

    // Add margin bottom to main
    document.querySelector('.main').style.paddingBottom = '70px'
})

// Stop stars animation when audio stops playing
currentAudio.addEventListener('ended', () => {
    isPaused = true
    animateStars()
})

// Render Beats List
const beatsList = document.querySelector('.beats__list')
const renderLimit = 8

function renderBeatsList(beats, limit) {
    let beatsString = ''

    for (let i = 0; i < limit; i++) {
        const audio = new Audio(beats[i].audio)
        audio.preload = 'auto'
        beatsString += `
            <li class="beats__list-item">
                <div class="beats__list-cover">
                    <img 
                        class="beats__list-cover-img" 
                        src="${beats[i].cover}"
                        alt="beat cover">
                </div>
                <p class="beats__list-title">${beats[i].title}</p>
                <p class="beats__list-text beats__list-text-time">${
                    beats[i].time
                }</p>
                <p class="beats__list-text beats__list-text-bpm">${
                    beats[i].bpm
                }</p>
                <ul class="genres">
                    ${getGenres(beats[i].genres)}
                </ul>
                <div class="beat-buttons">
                    <a class="beat-btn" href="${beats[i].link}" target='_blank'>
                        <img 
                            class="beat-btn__icon" 
                            src="./images/download-icon.svg" 
                            alt="download icon">
                    </a>
                    <button class="beat-btn" id="beats-share-btn">
                        <img 
                            class="beat-btn__icon" 
                            src="./images/share-icon.svg" 
                            alt="share icon">
                    </button>
                    <a class="beat-btn" href="${beats[i].link}" target='_blank'>
                        $15
                    </a>
                </div>
                <audio class="beats__list-audio" src="${
                    beats[i].audio
                }"></audio>
            </li>
        `
    }

    beatsList.innerHTML = beatsString
}

function getGenres(genresArr) {
    return genresArr
        .map((genre) => `<li class="genres__item">${genre}</li>`)
        .join('')
}

renderBeatsList(beats, renderLimit)

// Change beat by clicking on the beat from beats list
beatsList.addEventListener('click', (e) => {
    const beatItem = e.target.closest('.beats__list-item')
    if (!beatItem) return

    if (
        !e.target.classList.contains('beat-btn') &&
        !e.target.classList.contains('beat-btn__icon')
    ) {
        const beatTitle =
            beatItem.querySelector('.beats__list-title').textContent
        const beat = beats.find((beat) => beat.title === beatTitle)

        // Change current beat index
        currentBeatIndex = beats.indexOf(beat)

        // Change audio and play it instantly
        currentAudio.pause()

        currentAudio.src = beat.audio
        currentAudio.load()

        currentAudio.removeEventListener('canplay', handleCanPlay, {
            once: true,
        })
        currentAudio.addEventListener('canplay', handleCanPlay, { once: true })

        function handleCanPlay() {
            currentAudio
                .play()
                .catch((error) => console.error('Play error:', error))
            // Update current time, waveform progress, waveform animations, toggle play buttons and animate stars
            isPaused = false

            requestAnimationFrame(() => updateAudioCurrentTime(currentAudio))
            requestAnimationFrame(() => renderBarsAnimation(currentAudio))
            requestAnimationFrame(() => renderAudioProgress(currentAudio))

            togglePlayAndPauseIcons(
                beatPlayIcon,
                beatPauseIcon,
                beatFixedPlayIcon,
                beatFixedPauseIcon
            )
            animateStars()
        }

        // Change main beat info
        renderMainBeatInfo(beat)
        // Change beat fixed info
        renderBeatFixedInfo(beat)
    }
})

// Change progress of the volume
const volumeEl = document.querySelector('.beat-fixed__volume-range')
const volumeLow = document.querySelector('.beat-fixed__volume-low')
const volumeMedium = document.querySelector('.beat-fixed__volume-medium')
const volumeHigh = document.querySelector('.beat-fixed__volume-high')

// Set current audio volume be default
currentAudio.volume = +volumeEl.value / 100
const percentage = (volumeEl.value / volumeEl.max) * 100
volumeEl.style.backgroundSize = `${percentage}% 100%`

// Change volume value when user change volume input
volumeEl.addEventListener('input', () => {
    const inputValue = +volumeEl.value

    changeInputRange(inputValue)
    changeAudioVolume(inputValue)
    changeVolumeIcons(inputValue)
})

// Mute sound by clicking on the volume icon
const volumeIcon = document.querySelector('.beat-fixed__volume-icon')
let previousVolume = ''

volumeIcon.addEventListener('click', () => {
    if (previousVolume === '') {
        // Remember previous volume
        const inputValue = +volumeEl.value
        previousVolume = inputValue

        // Change volume input value
        volumeEl.value = '0'

        // Change volume input and icons
        changeInputRange(0)
        changeAudioVolume(0)
        changeVolumeIcons(0)
    } else {
        // Change volume input value
        volumeEl.value = previousVolume.toString()

        changeInputRange(previousVolume)
        changeAudioVolume(previousVolume)
        changeVolumeIcons(previousVolume)
        previousVolume = ''
    }
})

// Change input range style
function changeInputRange(value) {
    const percentage = (value / volumeEl.max) * 100
    volumeEl.style.backgroundSize = `${percentage}% 100%`
}

// Change volume icons
function changeVolumeIcons(value) {
    if (value === 0) {
        volumeLow.style.opacity = '0'
        volumeMedium.style.opacity = '0'
        volumeHigh.style.opacity = '0'
    }

    if (value > 0 && value <= 11) {
        volumeLow.style.opacity = '1'
        volumeMedium.style.opacity = '0'
        volumeHigh.style.opacity = '0'
    }

    if (value > 11) {
        volumeLow.style.opacity = '1'
        volumeMedium.style.opacity = '1'
        volumeHigh.style.opacity = '0'
    }

    if (value === 50) {
        volumeHigh.style.opacity = '1'
        volumeLow.style.opacity = '1'
        volumeMedium.style.opacity = '1'
    }
}

// Change audio volume
function changeAudioVolume(value) {
    const audioVolume = value / 100
    currentAudio.volume = audioVolume
}

// Change to prev and next beat
const prevBtn = document.querySelector('.beat-fixed__prev')
const nextBtn = document.querySelector('.beat-fixed__next')

prevBtn.addEventListener('click', () => changeBeatNextPrev(true, false))
nextBtn.addEventListener('click', () => changeBeatNextPrev(false, true))

function changeBeatNextPrev(isPrev = false, isNext = false) {
    if (isPrev) {
        const prevBeatIndex = currentBeatIndex - 1

        if (beats[prevBeatIndex]) {
            const beat = beats[prevBeatIndex]

            renderMainBeatInfo(beat)
            renderBeatFixedInfo(beat)

            currentBeatIndex = prevBeatIndex
        }
    }
    if (isNext) {
        const nextBeatIndex = currentBeatIndex + 1

        if (beats[nextBeatIndex]) {
            const beat = beats[nextBeatIndex]

            renderMainBeatInfo(beat)
            renderBeatFixedInfo(beat)

            currentBeatIndex = nextBeatIndex
        }
    }
    currentAudio.play()
    isPaused = false
    togglePlayAndPauseIcons(
        beatPlayIcon,
        beatPauseIcon,
        beatFixedPlayIcon,
        beatFixedPauseIcon
    )
    animateStars()
    requestAnimationFrame(() => updateAudioCurrentTime(currentAudio))
    requestAnimationFrame(() => renderBarsAnimation(currentAudio))
    requestAnimationFrame(() => renderAudioProgress(currentAudio))
}

// Animations
function animateStars() {
    // Play animations only if audio is playing
    if (!isPaused && !currentAudio.ended) {
        gsap.to('.stars-animation', {
            x: () => gsap.utils.random(-10, 10),
            y: () => gsap.utils.random(-10, 10),
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
        })
        gsap.to('.stars-animation', {
            opacity: '0.7',
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
        })
    } else {
        gsap.killTweensOf('.stars-animation')
    }
}
