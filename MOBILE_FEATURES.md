# 📱 5 Min Case - Mobile PWA Features

Your app now has full mobile PWA capabilities with swipe gestures!

## 🎯 What's New

### PWA Features
- **Installable**: Add to home screen on iOS/Android
- **Offline Support**: Service worker caches content
- **App-like Experience**: Full screen, no browser UI
- **Push Notifications**: Ready for future implementation

### Swipe Gestures
- **Swipe Up**: Next case
- **Swipe Down**: Previous case  
- **Swipe Left**: Bookmark case
- **Swipe Right**: Share case
- **Tap Brief**: Expand/collapse 5-minute summary

## 📲 Testing on Mobile

### Method 1: Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Pixel, etc.)
4. Refresh the page

### Method 2: Real Device (Recommended)
1. Find your computer's IP:
   - Mac: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. On your phone, visit: `http://YOUR_IP:3000`
3. Make sure phone is on same WiFi

## 🚀 Installing as PWA

### iOS (iPhone/iPad)
1. Open in Safari (must be Safari!)
2. Tap share button (square with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Name it "5 Min Case"
5. Tap "Add"

### Android
1. Open in Chrome
2. You'll see "Add 5 Min Case to Home screen" prompt
3. Tap "Install"
4. Or tap menu (3 dots) → "Add to Home screen"

## 🎨 Mobile UI Features

### Progress Indicator
- Shows current case number (e.g., "3/10")
- Progress bar fills as you swipe through cases

### Swipe Indicators
- Animated arrows show available swipe directions
- Visual feedback when swiping (bookmark/share icons appear)

### Expandable Brief
- Tap the 5-minute brief card to expand/collapse
- Smooth animation between states

### Action Buttons
- Bottom bar with bookmark, source link, and share
- Share uses native share sheet on mobile

## 🧪 Testing Checklist

- [ ] Swipe up to go to next case
- [ ] Swipe down to go to previous case
- [ ] Swipe left to bookmark (star fills)
- [ ] Swipe right to share (native share dialog)
- [ ] Tap 5-min brief to expand
- [ ] Install as PWA
- [ ] Open from home screen
- [ ] Test offline (turn on airplane mode)

## 🔧 Customization

### Change Swipe Sensitivity
Edit `components/SwipeableCase.tsx`:
```typescript
const SWIPE_THRESHOLD = 50 // Lower = more sensitive
const VELOCITY_THRESHOLD = 500 // Lower = easier swipes
```

### Add Haptic Feedback
```typescript
// Add to swipe handlers
if ('vibrate' in navigator) {
  navigator.vibrate(10) // 10ms vibration
}
```

### Custom Animations
Modify framer-motion settings in `SwipeableCase.tsx`

## 🐛 Troubleshooting

### "Add to Home Screen" not showing
- iOS: Must use Safari, not Chrome
- Clear Safari cache and try again
- Make sure you're on HTTPS in production

### Swipes not working
- Check if JavaScript is enabled
- Try increasing SWIPE_THRESHOLD
- Test in different browser

### PWA not updating
- Service worker caches aggressively
- In dev: Clear cache in DevTools
- In prod: Update CACHE_NAME in sw.js

## 📊 Mobile Analytics

Track mobile usage by checking:
- `navigator.standalone` (iOS PWA)
- `window.matchMedia('(display-mode: standalone)')` (Android PWA)
- Send to your analytics provider

## 🚀 Next Steps

1. Add haptic feedback for better UX
2. Implement gesture tutorials on first use
3. Add offline case download feature
4. Push notifications for new cases
5. Background sync for saved cases

Your legal doomscroll is now mobile-first! 📱⚖️
