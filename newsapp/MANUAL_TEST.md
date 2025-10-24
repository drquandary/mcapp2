# Manual Swipe Test Instructions

## Test on Your Phone

1. Open this URL on your phone:
   **https://f2e476cf9220.ngrok-free.app**

2. Go through onboarding (select some interests and click Get Started)

3. You should see a card with an article

4. **Test the swipe:**
   - Touch the card (not the buttons!)
   - Drag your finger left or right
   - You should see:
     - 👎 emoji fade in when swiping left
     - ❤️ emoji fade in when swiping right
     - Card should rotate slightly and move with your finger
   - Release to complete the swipe

5. **Test the undo:**
   - After swiping, look for an "Undo" button in the top-right
   - Tap it to bring back the last card

## What to Look For

### Visual Feedback During Swipe:
- [ ] Card moves with your finger
- [ ] Card rotates slightly
- [ ] Emoji indicator appears (👎 left, ❤️ right)
- [ ] Card opacity decreases as you swipe further

### After Completing Swipe:
- [ ] Card flies off the screen
- [ ] Next card appears
- [ ] "Undo" button appears in top-right corner

### Undo Function:
- [ ] Clicking Undo brings back the last card
- [ ] Undo button disappears when there's nothing to undo

## Troubleshooting

**If swipe doesn't work:**
1. Make sure you're touching the card content area, not the buttons
2. Try dragging at least 100px (about 1 inch)
3. Check browser console for errors (if using desktop Chrome)

**If you're testing on desktop:**
- Click and hold on the card
- Drag with your mouse
- Should work the same as mobile touch

##Debug Info

The swipe functionality adds console logs:
- "Swipe started at (x, y)" when you start dragging
- "Swiping right, opacity: X" or "Swiping left, opacity: X" while dragging
- These appear in the browser console (inspect element → Console tab)
