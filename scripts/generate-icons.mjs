#!/usr/bin/env node
/**
 * MVM Explorer — Icon & OG Image Generator
 * High-tech blockchain-style logo with geometric "M" design.
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '../public')

mkdirSync(PUBLIC, { recursive: true })

// ── MVM Brand Colors ──
const BG = '#0A0118'
const BG2 = '#120228'
const PURPLE = '#7B2CBF'
const NEON = '#9D4EDD'
const PINK = '#E040FB'
const CYAN = '#00D4FF'

// ── High-tech Icon SVG ──
function iconSvg(size) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r = Math.round(s * 0.16)
  const pad = s * 0.12
  const inner = s - pad * 2

  // M letter coordinates (geometric/angular style)
  const mLeft = s * 0.22
  const mRight = s * 0.78
  const mTop = s * 0.28
  const mBot = s * 0.72
  const mMid = cx
  const mPeak = s * 0.42
  const stroke = Math.max(2, s * 0.06)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG2}"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PURPLE}"/>
      <stop offset="50%" stop-color="${NEON}"/>
      <stop offset="100%" stop-color="${PINK}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${PINK}" stop-opacity="0.6"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${Math.max(1, s * 0.015)}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="outerGlow">
      <feGaussianBlur stdDeviation="${Math.max(2, s * 0.04)}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)"/>

  <!-- Corner accents (circuit-like) -->
  <line x1="${pad}" y1="${pad + s * 0.08}" x2="${pad}" y2="${pad}" stroke="${NEON}" stroke-width="${Math.max(1, s * 0.01)}" opacity="0.4"/>
  <line x1="${pad}" y1="${pad}" x2="${pad + s * 0.08}" y2="${pad}" stroke="${NEON}" stroke-width="${Math.max(1, s * 0.01)}" opacity="0.4"/>
  <line x1="${s - pad}" y1="${s - pad - s * 0.08}" x2="${s - pad}" y2="${s - pad}" stroke="${PINK}" stroke-width="${Math.max(1, s * 0.01)}" opacity="0.4"/>
  <line x1="${s - pad}" y1="${s - pad}" x2="${s - pad - s * 0.08}" y2="${s - pad}" stroke="${PINK}" stroke-width="${Math.max(1, s * 0.01)}" opacity="0.4"/>

  <!-- Hexagon border (subtle) -->
  <polygon points="${cx},${pad * 0.8} ${s - pad * 0.6},${s * 0.28} ${s - pad * 0.6},${s * 0.72} ${cx},${s - pad * 0.8} ${pad * 0.6},${s * 0.72} ${pad * 0.6},${s * 0.28}"
    fill="none" stroke="url(#g)" stroke-width="${Math.max(0.5, s * 0.005)}" opacity="0.15"/>

  <!-- Inner glow circle -->
  <circle cx="${cx}" cy="${cy}" r="${s * 0.28}" fill="${NEON}" opacity="0.04" filter="url(#outerGlow)"/>

  <!-- Geometric M letter -->
  <polyline points="${mLeft},${mBot} ${mLeft},${mTop} ${mMid},${mPeak} ${mRight},${mTop} ${mRight},${mBot}"
    fill="none" stroke="url(#g)" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

  <!-- M center drop line -->
  <line x1="${mMid}" y1="${mPeak}" x2="${mMid}" y2="${mBot}" stroke="url(#accent)" stroke-width="${stroke * 0.6}" stroke-linecap="round" filter="url(#glow)"/>

  <!-- Dot accents at M vertices -->
  <circle cx="${mLeft}" cy="${mBot}" r="${Math.max(1, stroke * 0.5)}" fill="${CYAN}" opacity="0.8"/>
  <circle cx="${mRight}" cy="${mBot}" r="${Math.max(1, stroke * 0.5)}" fill="${PINK}" opacity="0.8"/>
  <circle cx="${mMid}" cy="${mPeak}" r="${Math.max(1, stroke * 0.5)}" fill="white" opacity="0.9"/>

  <!-- Bottom accent bar -->
  <rect x="${s * 0.3}" y="${s - pad * 0.7}" width="${s * 0.4}" height="${Math.max(1, s * 0.015)}" rx="${Math.max(0.5, s * 0.008)}" fill="url(#g)" opacity="0.5"/>
</svg>`
}

// ── OG Image SVG (1200x630) ──
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG2}"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PURPLE}"/>
      <stop offset="50%" stop-color="${NEON}"/>
      <stop offset="100%" stop-color="${PINK}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${PINK}" stop-opacity="0.6"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bigGlow">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Grid -->
  <g opacity="0.04">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="630" stroke="${NEON}" stroke-width="0.5"/>`).join('\n    ')}
    ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}" stroke="${NEON}" stroke-width="0.5"/>`).join('\n    ')}
  </g>

  <!-- Hexagon pattern (decorative) -->
  <polygon points="600,30 780,135 780,345 600,450 420,345 420,135"
    fill="none" stroke="${NEON}" stroke-width="1" opacity="0.08"/>
  <polygon points="600,60 750,150 750,330 600,420 450,330 450,150"
    fill="none" stroke="${PINK}" stroke-width="0.5" opacity="0.06"/>

  <!-- Central glow -->
  <circle cx="600" cy="240" r="180" fill="${NEON}" opacity="0.04" filter="url(#bigGlow)"/>

  <!-- Large geometric M -->
  <polyline points="440,340 440,140 600,230 760,140 760,340"
    fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
  <line x1="600" y1="230" x2="600" y2="340" stroke="url(#accent)" stroke-width="7" stroke-linecap="round" filter="url(#glow)"/>

  <!-- M vertex dots -->
  <circle cx="440" cy="340" r="5" fill="${CYAN}" opacity="0.9"/>
  <circle cx="760" cy="340" r="5" fill="${PINK}" opacity="0.9"/>
  <circle cx="440" cy="140" r="4" fill="${NEON}" opacity="0.7"/>
  <circle cx="760" cy="140" r="4" fill="${NEON}" opacity="0.7"/>
  <circle cx="600" cy="230" r="5" fill="white" opacity="0.9"/>

  <!-- Corner brackets -->
  <polyline points="40,80 40,40 80,40" fill="none" stroke="${NEON}" stroke-width="2" opacity="0.3"/>
  <polyline points="1120,80 1120,40 1160,40" fill="none" stroke="${NEON}" stroke-width="2" opacity="0.3" transform="scale(-1,1) translate(-1200,0)"/>
  <polyline points="40,550 40,590 80,590" fill="none" stroke="${PINK}" stroke-width="2" opacity="0.3"/>
  <polyline points="1120,550 1120,590 1160,590" fill="none" stroke="${PINK}" stroke-width="2" opacity="0.3" transform="scale(-1,1) translate(-1200,0)"/>

  <!-- Title -->
  <text x="600" y="430" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="52" fill="white" text-anchor="middle" letter-spacing="6" filter="url(#textGlow)">MOHSIN</text>

  <!-- Subtitle -->
  <text x="600" y="475" font-family="Arial, sans-serif" font-weight="400" font-size="22" fill="${NEON}" text-anchor="middle" letter-spacing="6">EXPLORER</text>

  <!-- Tagline -->
  <text x="600" y="515" font-family="Arial, sans-serif" font-weight="300" font-size="15" fill="${NEON}" text-anchor="middle" opacity="0.5">Mohsin Virtual Machine — Blockchain Explorer</text>

  <!-- Bottom accent -->
  <rect x="350" y="545" width="500" height="2" rx="1" fill="url(#g)" opacity="0.4"/>
  <rect x="0" y="624" width="1200" height="6" fill="url(#g)" opacity="0.8"/>
</svg>`
}

// ── Generate all icons ──
async function main() {
  console.log('Generating MVM Explorer icons...\n')

  const icons = [
    [16, 'favicon-16x16.png'],
    [32, 'favicon-32x32.png'],
    [48, 'favicon-48x48.png'],
    [72, 'icon-72.png'],
    [96, 'icon-96.png'],
    [128, 'icon-128.png'],
    [144, 'icon-144.png'],
    [152, 'icon-152.png'],
    [180, 'apple-touch-icon.png'],
    [192, 'icon-192.png'],
    [384, 'icon-384.png'],
    [512, 'icon-512.png'],
  ]

  for (const [size, name] of icons) {
    const svg = Buffer.from(iconSvg(size))
    await sharp(svg).png().toFile(resolve(PUBLIC, name))
    console.log(`  ✅ ${name} (${size}x${size})`)
  }

  // OG Image
  const ogBuffer = Buffer.from(ogSvg())
  await sharp(ogBuffer).png({ quality: 90 }).toFile(resolve(PUBLIC, 'og-image.png'))
  console.log(`  ✅ og-image.png (1200x630)`)

  // Favicon SVG
  writeFileSync(resolve(PUBLIC, 'favicon.svg'), iconSvg(100))
  console.log(`  ✅ favicon.svg (updated)`)

  // Web manifest
  const manifest = {
    name: 'Mohsin Explorer',
    short_name: 'Mohsin',
    description: 'Explore the Mohsin Virtual Machine blockchain',
    start_url: '/',
    display: 'standalone',
    background_color: BG,
    theme_color: PURPLE,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }
  writeFileSync(resolve(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2))
  console.log(`  ✅ site.webmanifest`)

  console.log('\nDone! All icons generated in public/')
}

main().catch(console.error)
