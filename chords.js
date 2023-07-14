const { Midi } = require("@tonejs/midi");
const { Note, Key, Chord, Midi: MidiTonal } = require("@tonaljs/tonal");
const fs = require("fs");

// transposes notes properly

// get the root note
// get it's midi value
// for each of the chord notes
//   get the midi value of them in the middle octave
// if chord note < midi note, add 12 until it's not
const getScientificChordNotes = (chordNotes) => {
  const sciRootNote = MidiTonal.toMidi(chordNotes[0] + "5");
  const sciChordNotes = chordNotes.slice(1).map((chordNote) => {
    let sciChordNote = MidiTonal.toMidi(chordNote + "5");
    if (sciChordNote < sciRootNote) {
      sciChordNote += 12;
    }
    return sciChordNote;
  });
  return [sciRootNote, ...sciChordNotes];
};

//different octacves
const getDifferentOctaves = (midiChordNotes, direction) => {
  const newMidiChordNotes = midiChordNotes.map((midiChordNote) => {
    let newMidiChordNote = midiChordNote;
    if (direction === "up") {
      newMidiChordNote += 12;
    } else if (direction === "down") {
      newMidiChordNote -= 12;
    }

    return newMidiChordNote;
  });
  return newMidiChordNotes;
};

//different voicings
const getChordWithLowerRoot = (midiChordNotes) => {
  const lowerRoot = midiChordNotes[0] - 12;
  const newMidiChordNotes = [lowerRoot, ...midiChordNotes];

  return newMidiChordNotes;
};

// Function to generate MIDI file with chords for a scale
const generateScaleChordsMIDI = (scaleName, chordType) => {
  const midi = new Midi();

  const { chords } =
    chordType === "Major"
      ? Key.majorKey(scaleName)
      : Key.minorKey(scaleName).natural;
  // Add chords to MIDI file
  let chordIdx = 0;
  let time = 0;
  for (let i = 0; i < chords.length; i++) {
    const chord = Chord.get(chords[i]);
    const chordNotes = chord.notes;
    const sciChordNotes = getScientificChordNotes(chordNotes);
    const lowerChords = getDifferentOctaves(sciChordNotes, "down");
    const higherChords = getDifferentOctaves(sciChordNotes, "up");
    const lowerRootChord = getChordWithLowerRoot(sciChordNotes);
    // chordIdx++;
    const allChords = [
      sciChordNotes,
      lowerChords,
      higherChords,
      lowerRootChord,
    ];
    for (let j = 0; j < allChords.length; j++) {
      //   chordIdx++;
      time += 2;

      for (let k = 0; k < allChords[j].length; k++) {
        // chordIdx++;
        const note = allChords[j][k];
        // const time = chordIdx;
        const part = midi.addTrack();

        part.addNote({
          midi: MidiTonal.toMidi(note),
          time: time,
          duration: "2n",
          velocity: 100,
        });
      }
      time += 2;
    }
  }

  // Save the MIDI file
  const fileName = scaleName + chordType + "_chords.mid";
  fs.writeFileSync(fileName, Buffer.from(midi.toArray()));
  console.log("MIDI file saved:", fileName);
};

const chordTypes = ["Major", "minor"];
const notes = Note.names();

// Generate MIDI files for all scales and chord types
for (let i = 0; i < notes.length; i++) {
  const note = notes[i];
  for (let j = 0; j < chordTypes.length; j++) {
    const chordType = chordTypes[j];
    const chordTypeWord = chordType === "M" ? "Major" : "Minor";
    generateScaleChordsMIDI(note, chordTypeWord);
  }
}
