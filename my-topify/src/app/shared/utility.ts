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

export function getFirstArtist(artists: string): string {
  const end = artists.indexOf(',');

  if (end === -1) {
    return artists;
  } else {
    return artists.substring(0, end);
  }
}
