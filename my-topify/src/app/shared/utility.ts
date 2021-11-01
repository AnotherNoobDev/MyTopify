/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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

/**
 * Returns a debounced version of the given input function cb
 * that will execute after waitFor ms from the last call 
 */
export const debounce = <F extends (...args: any[]) => any>( cb: F, waitFor: number) => {
  let timeout: number = 0;

  const debounced = (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => cb(...args), waitFor);
  };

  return debounced as unknown as (...args: Parameters<F>) => ReturnType<F>;
}
