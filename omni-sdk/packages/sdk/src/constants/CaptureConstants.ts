/**
 * Global capture constants
 * Used across plugins and rrweb to handle no-capture, ignore, and mask classes
 */

export const CAPTURE_CONSTANTS = {
  /**
   * Class name to completely block/exclude elements from capture
   * Elements with this class and their children won't be captured by click tracking or rrweb
   */
  NO_CAPTURE_CLASS: "om-no-capture",

  /**
   * Class name to ignore elements in rrweb recording
   */
  IGNORE_CLASS: "om-ignore",

  /**
   * Class name to mask content in rrweb recording
   */
  MASK_CLASS: "om-mask",
} as const;
