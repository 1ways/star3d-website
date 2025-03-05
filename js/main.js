import { beats } from './data.js'

window.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let currentBeatIndex = 0
    // set first beat's audio by default
    let currentAudio = new Audio(beats[currentBeatIndex].audio)
    let currentPage = window.location.pathname
    let renderLimit = currentPage === '/' ? 8 : beats.length
    let currentBeat = beats[currentBeatIndex]
    let currentBeatsArray = []
    let barsItems = document.querySelectorAll('.beat__waveform-bar')

    // Render Main Beat
    function renderMainBeatInfo(beat) {
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

    // Render waveform and bars
    const waveformContainer = document.getElementById('beat-waveform')
    let totalBars = Math.round(waveformContainer?.offsetWidth * 0.1665)
    if (currentPage === '/') {
        // Change totalBars when screen width lower than 1250px
        window.addEventListener('resize', () => {
            totalBars = Math.round(waveformContainer.offsetWidth * 0.1665)

            waveformContainer.innerHTML = ''
            renderWaveformBars()
            barsItems = document.querySelectorAll('.beat__waveform-bar')
            barsAnimation(currentAudio)
        })
    }

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

    // Render first beat by default
    if (currentPage === '/') {
        renderMainBeatInfo(beats[0])
        renderWaveformBars()
    }
    renderBeatFixedInfo(beats[0])

    // Bars Animation Logic
    barsItems = document.querySelectorAll('.beat__waveform-bar')

    function barsAnimation(audio) {
        barsItems.forEach((bar) => {
            const randomBarHeight =
                Math.floor(Math.random() * (46 - 27 + 1)) + 27
            bar.style.height = `${randomBarHeight}px`
        })

        if (!audio.paused && !audio.ended) {
            setTimeout(
                () => requestAnimationFrame(() => barsAnimation(currentAudio)),
                100
            )
        }
    }

    // Render bars animation when page loads
    if (currentPage === '/') {
        barsAnimation(currentAudio)
    }

    // Beat and Fixed Beat play btns and icons
    const beatPlayBtn = document.getElementById('beat-play-btn')
    const beatPlayIcon = document.getElementById('play-icon')
    const beatPauseIcon = document.getElementById('pause-icon')

    const beatFixedPlayBtn = document.querySelector('.beat-fixed__play')
    const beatFixedPlayIcon = document.querySelector('.beat-fixed__play-icon')
    const beatFixedPauseIcon = document.querySelector('.beat-fixed__pause-icon')

    if (beatPlayBtn) {
        beatPlayBtn.addEventListener('click', audioHandle)
    }
    beatFixedPlayBtn.addEventListener('click', audioHandle)

    // Play buttons icons change logic
    function togglePlayAndPauseIcons(
        playIcon,
        pauseIcon,
        playFixedIcon,
        pauseFixedIcon
    ) {
        if (playIcon && pauseIcon) {
            playIcon.style.display = currentAudio.paused ? 'block' : 'none'
            pauseIcon.style.display = currentAudio.paused ? 'none' : 'block'
        }

        playFixedIcon.style.display = currentAudio.paused ? 'block' : 'none'
        pauseFixedIcon.style.display = currentAudio.paused ? 'none' : 'block'
    }

    // Update Audio Time in Beat Info Section
    const timeEl = document.getElementById('beat-info-time')

    function updateAudioCurrentTime(audio) {
        if (timeEl) {
            const update = () => {
                if (audio.ended) {
                    timeEl.textContent = '00:00'
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
                if (!audio.paused) {
                    requestAnimationFrame(update)
                }
            }
            update()
        }
    }

    // Update Audio Progress
    const currentFixedProgressBar = document.querySelector(
        '.beat-fixed__progress-current'
    )

    function updateAudioProgress(audio) {
        if (waveformContainer) {
            // Update audio progress for waveform
            const currentBarIndex = Math.floor(
                (audio.currentTime / audio.duration) * totalBars
            )

            barsItems.forEach((bar, index) => {
                bar.classList.toggle('active', index <= currentBarIndex)
            })
        }

        // Update audio progress for fixed progress bar
        const percentage = (audio.currentTime / audio.duration) * 100

        currentFixedProgressBar.style.width = `${percentage}%`

        if (!audio.paused && !audio.ended) {
            requestAnimationFrame(() => updateAudioProgress(currentAudio))
        }

        if (audio.ended) {
            if (waveformContainer) {
                barsItems.forEach((bar) => {
                    bar.classList.remove('active')
                })
            }

            currentFixedProgressBar.style.width = '0%'
            audio.currentTime = '0'
        }

        if (audio.currentTime === 0 && waveformContainer) {
            barsItems.forEach((bar) => {
                bar.classList.remove('active')
            })
        }
    }

    // Change Audio time by clicking the bar
    function changeAudioTime(audio, index) {
        if (waveformContainer) {
            audio.currentTime = (index / totalBars) * audio.duration

            barsItems.forEach((bar) => {
                bar.classList.remove('active')
            })
        }
    }

    if (waveformContainer) {
        waveformContainer.addEventListener('click', (e) => {
            const bar = e.target.closest('.beat__waveform-bar-container')

            if (!bar) return

            const index = [...bar.parentElement.children].indexOf(bar)

            changeAudioTime(currentAudio, index)

            if (currentAudio.paused) {
                audioHandle()
            }
        })
    }

    // Render Beats List
    const beatsList = document.querySelector('.beats__list')

    function renderBeatsList(beatsArr, limit) {
        currentBeatsArray = []
        if (beatsArr.length === 0) {
            beatsList.innerHTML =
                '<h3 class="beats__list-no-matches">No matches found<h3>'
            return
        }

        if (beatsList) {
            let beatsString = ''

            for (let i = 0; i < limit; i++) {
                beatsString += `
                                <li class="beats__list-item ${
                                    currentBeat.title === beatsArr[i].title
                                        ? 'highlight'
                                        : ''
                                }">
                                    <div class="beats__list-cover">
                                        <img 
                                            class="beats__list-cover-img" 
                                            src="${beatsArr[i].cover}"
                                            alt="beat cover">
                                    </div>
                                    <p class="beats__list-title">${
                                        beatsArr[i].title
                                    }</p>
                                    <p class="beats__list-text beats__list-text-time">${
                                        beatsArr[i].time
                                    }</p>
                                    <p class="beats__list-text beats__list-text-bpm">${
                                        beatsArr[i].bpm
                                    }</p>
                                    <ul class="genres">
                                        ${getGenres(beatsArr[i].genres)}
                                    </ul>
                                    <div class="beat-buttons">
                                        <a class="beat-btn" href="${
                                            beatsArr[i].link
                                        }" target='_blank'>
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
                                        <a class="beats__list-buy" href="${
                                            beatsArr[i].link
                                        }" target='_blank'>
                                            <span class="beats__list-buy-text">BUY</span>
                                            <img class="beats__list-buy-icon" src="./images/buy-icon.svg" alt="buy icon">
                                        </a>
                                    </div>
                                </li>
                            `
                currentBeatsArray.push(beatsArr[i])
            }

            beatsList.innerHTML = beatsString

            currentBeatIndex = currentBeatsArray.indexOf(currentBeat)
        }
    }

    renderBeatsList(beats, renderLimit)

    // Return string with all genres
    function getGenres(genresArr) {
        return genresArr
            .map((genre) => `<li class="genres__item">${genre}</li>`)
            .join('')
    }

    // Change beat by clicking on the beat from beats list
    beatsList.addEventListener('click', (e) => {
        const beatItem = e.target.closest('.beats__list-item')

        if (!beatItem) return

        if (
            !e.target.classList.contains('beat-btn') &&
            !e.target.classList.contains('beat-btn__icon') &&
            !e.target.classList.contains('beats__list-buy') &&
            !e.target.classList.contains('beats__list-buy-text') &&
            !e.target.classList.contains('beats__list-buy-icon')
        ) {
            const beatTitle =
                beatItem.querySelector('.beats__list-title').textContent

            if (currentBeat.title === beatTitle) {
                if (currentAudio.paused) {
                    audioHandle()
                } else {
                    audioHandle()
                }
                return
            }

            const beat = beats.find((beat) => beat.title === beatTitle)

            changeBeat(beat)

            if (currentPage === '/') {
                // Change main beat info
                renderMainBeatInfo(beat)
            }
            // Change beat fixed info
            renderBeatFixedInfo(beat)
        }
    })

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

    // Change Fixed Progress bar by clicking on it
    const beatFixedProgressBar = document.querySelector('.beat-fixed__progress')

    beatFixedProgressBar.addEventListener('click', (e) => {
        const progressBarWidth = beatFixedProgressBar.clientWidth

        if (!e.target.classList.contains('beat-fixed__progress-thumb')) {
            const clickX = e.offsetX

            const percentage = Math.floor((clickX / progressBarWidth) * 100)
            currentAudio.currentTime =
                (percentage / 100) * currentAudio.duration

            if (currentPage === '/') {
                updateAudioCurrentTime(currentAudio)
            }
            updateAudioProgress(currentAudio)
        }
    })

    // Change Fixed Progress bar by dragging the thumb
    const thumb = document.querySelector('.beat-fixed__progress-thumb')

    function dragThumb() {
        thumb.addEventListener('mousedown', mouseDown)

        function mouseDown() {
            document.addEventListener('mousemove', mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }

        function mouseMove(e) {
            let currentX = e.clientX

            const progressBarWidth = beatFixedProgressBar.clientWidth

            const percentage = Math.floor((currentX / progressBarWidth) * 100)
            currentAudio.currentTime =
                (percentage / 100) * currentAudio.duration

            if (currentPage === '/') {
                updateAudioCurrentTime(currentAudio)
            }

            updateAudioProgress(currentAudio)
        }

        function mouseUp() {
            document.removeEventListener('mousemove', mouseMove)
        }
    }

    dragThumb()

    currentAudio.addEventListener('play', () => {
        // Show fixed beat
        fixedBeatEl.style.transform = `translateY(0)`
        // Add margin bottom to the body
        document.body.style.paddingBottom = '70px'

        // Start waveform animation
        barsAnimation(currentAudio)

        if (currentBeatsArray.length) {
            // Highlight current beat in beat list
            const beatsListItems = [...beatsList.children]
            const currentBeatItem = beatsListItems?.find(
                (beatItem) =>
                    beatItem.querySelector('.beats__list-title').textContent ===
                    currentBeat.title
            )

            // Remove prev highlighted item
            beatsListItems.forEach((item) => item.classList.remove('highlight'))

            if (currentBeatItem) currentBeatItem.classList.add('highlight')
        }
    })

    // Stop stars animation when audio stops playing
    currentAudio.addEventListener('ended', () => {
        animateStars()

        if (currentBeatsArray.length) {
            currentBeatIndex = (currentBeatIndex + 1) % renderLimit

            // Change beat to the next when audio ends
            const nextBeat = currentBeatsArray[currentBeatIndex]
            changeBeat(nextBeat)
        } else {
            audioHandle()
        }
    })

    // Change to prev and next beat
    const prevBtn = document.querySelector('.beat-fixed__prev')
    const nextBtn = document.querySelector('.beat-fixed__next')

    prevBtn.addEventListener('click', () => {
        if (currentBeatsArray.length) {
            if (currentBeatIndex === 0) {
                currentBeatIndex = renderLimit - 1
            } else {
                currentBeatIndex -= 1
            }

            // Change beat index to the prev beat
            const prevBeat = currentBeatsArray[currentBeatIndex]

            changeBeat(prevBeat)
        }
    })

    nextBtn.addEventListener('click', () => {
        if (currentBeatsArray.length) {
            if (currentBeatIndex === renderLimit - 1) {
                currentBeatIndex = 0
            } else {
                currentBeatIndex += 1
            }

            // Change beat index to the next beat
            const nextBeat = currentBeatsArray[currentBeatIndex]

            changeBeat(nextBeat)
        }
    })

    // Change beat logic
    function changeBeat(beat) {
        // Change current beat
        currentBeat = beat
        // Change current beat index
        currentBeatIndex = currentBeatsArray.indexOf(beat)

        // Pause current Audio and reset the time
        currentAudio.pause()
        currentAudio.currentTime = 0

        // Change audio
        currentAudio.src = beat.audio

        // Play audio
        audioHandle()

        if (currentPage === '/') {
            // Change main beat info
            renderMainBeatInfo(beat)
        }
        // Change beat fixed info
        renderBeatFixedInfo(beat)
    }

    // Audio Logic
    function audioHandle() {
        if (currentAudio.paused) {
            currentAudio.play().catch((err) => {})
        } else {
            currentAudio.pause()
        }

        if (currentPage === '/') {
            updateAudioCurrentTime(currentAudio)
            // barsAnimation(currentAudio)
        }
        updateAudioProgress(currentAudio)
        togglePlayAndPauseIcons(
            beatPlayIcon,
            beatPauseIcon,
            beatFixedPlayIcon,
            beatFixedPauseIcon
        )
        animateStars()
    }

    // Change progress of the volume
    const volumeEl = document.querySelector('.beat-fixed__volume-range')
    const volumeLow = document.querySelector('.beat-fixed__volume-low')
    const volumeMedium = document.querySelector('.beat-fixed__volume-medium')
    const volumeHigh = document.querySelector('.beat-fixed__volume-high')

    // Set current audio volume by default
    currentAudio.volume = +volumeEl.value / 50
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
        const audioVolume = value / 50
        currentAudio.volume = audioVolume
    }

    // Render selects options
    function getOptionsArr(key) {
        if (key === 'bpm') {
            return new Set(
                beats.map((beat) => beat[`${key}`]).sort((a, b) => a - b)
            )
        } else {
            return new Set(beats.flatMap((beat) => beat[key]))
        }
    }

    function renderSelectOptions() {
        console.log(currentPage)

        const bpmSelectBody = document.getElementById('bpm-select')
        const genresSelectBody = document.getElementById('genres-select')

        let bpmHtml = '<div class="beats__select-option">All Bpm</div>'
        let genresHtml = '<div class="beats__select-option">All Genres</div>'

        const bpmOptionsArr = getOptionsArr('bpm')
        const genresOptionsArr = getOptionsArr('genres')

        for (let option of bpmOptionsArr) {
            bpmHtml += `<div class="beats__select-option">${option}</div>`
        }

        for (let option of genresOptionsArr) {
            genresHtml += `<div class="beats__select-option">${option}</div>`
        }

        bpmSelectBody.innerHTML = bpmHtml
        genresSelectBody.innerHTML = genresHtml
    }

    currentPage === '/beats.html' && renderSelectOptions()

    // Window events
    window.addEventListener('click', (e) => {
        const licensingModal = document.getElementById('licensing-modal')
        const privacyPolicyModal = document.getElementById(
            'privacy-policy-modal'
        )

        if (e.target.id === 'licensing') {
            licensingModal.classList.add('show')
        } else if (e.target.id === 'privacy-policy') {
            privacyPolicyModal.classList.add('show')
        } else if (
            e.target.classList.contains('modal__close-icon') ||
            e.target.classList.contains('modal')
        ) {
            // Close current showed modal by clicking close button
            const showedModal = document.querySelector('.modal.show')

            showedModal.classList.remove('show')
        } else if (
            e.target.classList.contains('header__burger') ||
            e.target.classList.contains('header__burger-line')
        ) {
            // Burger menu logic
            const navMenu = document.querySelector('.header__nav')
            const burgerBtn = e.target.closest('.header__burger')

            burgerBtn.classList.toggle('show')
            navMenu.classList.toggle('show')
        }

        // Selects logic
        const select = e.target.closest('.beats__select')

        if (select) {
            select.classList.add('show')

            if (e.target.classList.contains('beats__select-option')) {
                const selectedOption = select.querySelector(
                    '.beats__select-selected'
                )

                selectedOption.textContent = e.target.textContent
                select.classList.remove('show')

                // Get selected options
                const bpmSelectedValue =
                    document.getElementById('bpm-selected').textContent
                const genresSelectedValue =
                    document.getElementById('genres-selected').textContent

                // Get filtered beats arr
                const getFilteredBeatsArr = () => {
                    if (
                        bpmSelectedValue === 'All Bpm' &&
                        genresSelectedValue === 'All Genres'
                    ) {
                        return beats
                    } else if (genresSelectedValue === 'All Genres') {
                        return beats.filter(
                            (beat) => beat.bpm === bpmSelectedValue
                        )
                    } else if (bpmSelectedValue === 'All Bpm') {
                        return beats.filter((beat) =>
                            beat.genres.includes(genresSelectedValue)
                        )
                    } else {
                        return beats.filter(
                            (beat) =>
                                beat.bpm === bpmSelectedValue &&
                                beat.genres.includes(genresSelectedValue)
                        )
                    }
                }

                const filteredArr = getFilteredBeatsArr()

                renderLimit = filteredArr.length
                // Render new beats list
                renderBeatsList(filteredArr, renderLimit)
            }
        } else {
            document
                .querySelectorAll('.beats__select')
                .forEach((select) => select.classList.remove('show'))
        }
    })

    // Change audio state by pressing space key
    window.addEventListener('keydown', (e) => {
        if (e.key == ' ' || e.code == 'Space' || e.keyCode == 32) {
            e.preventDefault()
            audioHandle()
        }
    })

    // Animations
    function animateStars() {
        if (currentPage === '/') {
            // Play animations only if audio is playing
            if (!currentAudio.paused && !currentAudio.ended) {
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
    }
})
