//@ts-check

//  =======
//  LIBRARY
//  =======

import * as CONSTANTS from "./modules/constants.js"
import { Video } from "./modules/Video.js"
import { Canvas } from "./modules/Canvas.js"
import { Renderer, HTMLRenderer, CanvasRenderer } from "./modules/Renderer.js"

//  =====
//  VIDEO
//  =====

const video = new Video(CONSTANTS.VIDEO)
const videoCanvas = new Canvas(CONSTANTS.VIDEO_CANVAS)

//  =====
//  ASCII
//  =====


const html = /** @type HTMLDivElement */ (document.getElementById(CONSTANTS.ASCII_VIDEO))
const canvas = /** @type HTMLCanvasElement */ (document.getElementById(CONSTANTS.ASCII_CANVAS))

/** @type {Renderer} */
let renderer = new CanvasRenderer(canvas)

/**
 * Select the Renderer
 * @param {'canvas' | 'html' | 'text'} option Renderer Modes
 */
export function selectRenderer(option) {
    if (renderer.type === option) { return }
    renderer.clean()
    switch (option) {
        case 'canvas': renderer = new CanvasRenderer(canvas); break;
        case 'html': renderer = new HTMLRenderer(html); break;
        case 'text': renderer = new HTMLRenderer(html); break;
        default: renderer = new CanvasRenderer(canvas);
    }
}

//  ====
//  DRAW
//  ====

function draw() {
    if (video.element.paused) { return }
    videoCanvas.render(video.element)
    renderer.render(videoCanvas.getPixelData())
    requestAnimationFrame(draw)
}

// ========
// CONTROLS
// ========

//  RENDERER SELECT
//  ---------------

const rendererSelection = /** @type HTMLSelectElement */ (document.getElementById(CONSTANTS.CTRL_RENDERER_SELECT))

rendererSelection.addEventListener('input', (e) => {
    const target = /** @type HTMLSelectElement */ (e.target)
    const value = /** @type { 'canvas' | 'html' | 'text' } */ (target.value)
    selectRenderer(value)
})

// SENSITIVITY SLIDER
// ------------------

const slider = /** @type HTMLInputElement */ (document.getElementById(CONSTANTS.CTRL_SENSITIVITY_SLIDER))

slider.addEventListener('input', (e) => {
    const target = /** @type HTMLInputElement  */ (e.target)
    const count = parseInt(target.value) + 1
    renderer.updateCharset((charset) => charset.trimEnd() + ' '.repeat(count))
})

// TOGGLE CAMERA BUTTON
// --------------------

const toggleCameraBtn = /** @type HTMLButtonElement */(document.getElementById(CONSTANTS.CTRL_TOGGLE_CAMERA))
toggleCameraBtn.addEventListener('click', () => video.toggleFacingMode)

// START BUTTON
// ------------

const startBtn = /** @type HTMLButtonElement */(document.getElementById(CONSTANTS.CTRL_START))
startBtn.addEventListener('click', async () => {
    await video.captureStream()
    draw()
})

// STOP BUTTON
// -----------

const stopBtn = /** @type HTMLButtonElement */(document.getElementById(CONSTANTS.CTRL_STOP))
stopBtn.addEventListener('click', () => video.pause())

//  SCREENSHOT BUTTON
//  -----------------

const download = /** @type HTMLAnchorElement */ (document.getElementById(CONSTANTS.OFFSCREEN_ANCHOR))

/** Time in milliseconds to disable the screenshot button as an attempt to prevent the user from spamming it. */
const timeoutDuration = 500

const screenshotButton = /** @type HTMLButtonElement */ (document.getElementById(CONSTANTS.SCREENSHOT))
screenshotButton.addEventListener('click', () => {
    //  Get the snapshot from the renderer
    const snapshot = renderer.snapshot()

    if (renderer.type === 'canvas') {
        //  If using the canvas-based renderer, download the screenshot
        download.setAttribute('href', snapshot)
        download.setAttribute('download', 'screenshot.png')
        download.click()
    } else if (renderer.type === 'html' || renderer.type === 'text') {
        //  If using a text-based renderer, copy the snapshot to clipboard
        navigator.clipboard.writeText(snapshot)
    }

    //  Disable the screenshot button for timeoutDuration to prevent spam
    screenshotButton.setAttribute('disabled', 'true')
    setTimeout(() => { screenshotButton.removeAttribute('disabled') }, timeoutDuration)
})

// CLEAR CANVAS BUTTON
// -------------------

const clearScreenButton = /** @type HTMLButtonElement */ (document.getElementById(CONSTANTS.CLEAR_SCREEN))

clearScreenButton.addEventListener('click', () => renderer.clean())

//  TOGGLE THEME BUTTON
//  -------------------

const toggleThemeButton = /** @type HTMLButtonElement */ (document.getElementById(CONSTANTS.TOGGLE_THEME))

/** Select the appropriate emoji based on the current theme */
const getToggleThemeEmoji = () => document.body.classList.contains(CONSTANTS.DARK_MODE) ? '🌞' : '🌙'

/** Returns the current theme */
const getTheme = () => document.body.classList.contains(CONSTANTS.DARK_MODE) ? 'dark' : 'light'


//  Initialize toggleThemeButton innerText
toggleThemeButton.innerText = getToggleThemeEmoji()

//  Toggle the DARK_MODE class on the body and update the toggleThemeButton's innerText
toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle(CONSTANTS.DARK_MODE)
    toggleThemeButton.innerText = getToggleThemeEmoji()
    addNotification(`Enabled ${getTheme()}-mode`)
})

// =============
// NOTIFICATIONS
// =============

const notifications = /** @type HTMLDivElement */ (document.getElementById(CONSTANTS.NOTIFICATIONS))

const notificationsTimeout = 2000

function addNotification(text) {
    const toast = document.createElement('div')
    toast.classList.add("notification", "fade-in")
    toast.innerText = text

    notifications.appendChild(toast)

    setTimeout(() => {
        toast.classList.add('fade-out')
        setTimeout(() => {
            notifications.removeChild(toast)
        }, 500)
    }, notificationsTimeout)
}
