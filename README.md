# Nova Mixer - Interactive Background Music Mixer

An interactive web-based audio mixer that allows you to play multiple instrument tracks simultaneously and control their individual volumes in real-time.

## Features

- 🎵 **Multiple Tracks**: Support for 6 instrument tracks (easily extensible)
- 🎨 **3 Beautiful Themes**: Aurora (purple/blue), Sunset (orange/pink), Ocean (teal/cyan)
- 🎚️ **Individual Volume Controls**: Fine-tune each instrument separately
- 🎛️ **Master Volume**: Global volume control for all tracks
- 💾 **State Persistence**: Your settings are automatically saved
- 📱 **Responsive Design**: Works beautifully on all devices
- ✨ **Premium UI**: Modern glassmorphism design with smooth animations

## Getting Started

### Running the Application

1. Open `index.html` in a modern web browser
2. Click the master play button to start all tracks
3. Adjust individual track volumes using the sliders
4. Use the theme selector in the header to change color schemes

### Using Your Own Audio Files

The application currently uses these audio files:
- `assets/NovaInstrument-ambience.wav`
- `assets/NovaInstrument-arpa.wav`
- `assets/NovaInstrument-bajo.wav`
- `assets/NovaInstrument-leimotif.wav`

To use different audio files:
1. Place your audio files in the `assets` folder
2. Update the file paths in `script.js` in the `TRACKS` array

## Adding More Tracks

Adding new tracks is incredibly easy! Just edit the `TRACKS` array in `script.js`:

```javascript
const TRACKS = [
    // ... existing tracks ...
    {
        id: 'track7',           // Unique ID
        name: 'Piano',          // Display name
        icon: '🎹',            // Emoji icon
        file: 'assets/piano.wav', // Audio file path
        enabled: true           // Enable the track
    }
];
```

That's it! The application will automatically:
- Create the UI for the new track
- Initialize the audio controls
- Set up volume mixing
- Save and restore the state

## Controls

### Master Controls
- **Play/Pause Button**: Start/stop all tracks simultaneously
- **Master Volume**: Control overall volume for all tracks

### Track Controls
- **Volume Slider**: Adjust individual track volume
- **Mute Button**: Mute/unmute specific tracks
- **Track Status**: Shows if track is playing or ready

### Theme Selector
Click any of the three colored buttons in the header to switch themes:
- 🌌 **Aurora**: Purple and blue gradients
- 🌅 **Sunset**: Orange and pink gradients
- 🌊 **Ocean**: Teal and cyan gradients

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Tips for Best Experience

- Use headphones for the best audio quality
- All tracks are synchronized and will loop continuously
- Your volume settings and theme preference are automatically saved
- Each track can be individually muted without stopping playback

## Technical Details

- **HTML5 Audio API**: For audio playback
- **CSS Variables**: For dynamic theming
- **LocalStorage**: For state persistence
- **Vanilla JavaScript**: No dependencies required

## File Structure

```
background-music/
├── index.html          # Main HTML file
├── style.css           # Styles and themes
├── script.js           # Application logic
├── assets/             # Audio files directory
│   ├── NovaInstrument-ambience.wav
│   ├── NovaInstrument-arpa.wav
│   ├── NovaInstrument-bajo.wav
│   └── NovaInstrument-leimotif.wav
└── README.md          # This file
```

## License

Free to use for personal and commercial projects.

---

**Enjoy creating your perfect background music mix! 🎵**
