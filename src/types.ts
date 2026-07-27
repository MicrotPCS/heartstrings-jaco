export interface Song {
  /** Unique id (slug from SoundCloud) */
  id: string
  /** Display title */
  title: string
  /** Optional genre / subtitle */
  subtitle?: string
  /**
   * Date the track was uploaded to SoundCloud (ISO 8601: YYYY-MM-DD).
   * Used for sorting — newest first by default.
   */
  soundcloudUploadDate: string
  /**
   * Dropbox share link to the audio file.
   * Leave empty ("") until the MP3 is uploaded and shared from Dropbox.
   * Example: https://www.dropbox.com/s/xxxxx/my-song.mp3?dl=0
   */
  dropboxAudioUrl: string
  /**
   * Cover / thumbnail image URL (SoundCloud artwork or Dropbox share link).
   */
  coverUrl: string
  /** Optional SoundCloud page URL */
  soundcloudUrl?: string
  /** Short blurb shown under the title */
  description?: string
  /** Duration in seconds (optional, for display) */
  durationSeconds?: number
}

export type SortOrder = 'newest' | 'oldest'

/** True when a playable Dropbox share link is present */
export function hasDropboxAudio(song: Song): boolean {
  return Boolean(song.dropboxAudioUrl?.trim())
}
