export function getTrackShortName(trackName: string): string {
  let end = trackName.indexOf('(');

  if (end === -1) {
    end = trackName.indexOf(' -');
  }

  if (end !== -1) {
    return trackName.substring(0, end);
  } else {
    return trackName;
  }
}
