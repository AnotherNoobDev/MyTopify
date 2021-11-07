/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Period } from "spotify-lib";

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
  const artistSeparator = ',';

  const end = artists.indexOf(artistSeparator);

  if (end === -1) {
    return artists;
  } else {
    return artists.substring(0, end);
  }
}


export function getDisplayablePeriod(period: Period) {
  switch (period) {
    case Period.ShortTerm:
      return 'last 4 weeks';
    case Period.MediumTerm:
      return 'last 6 months';
    case Period.LongTerm:
      return 'all time';
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
