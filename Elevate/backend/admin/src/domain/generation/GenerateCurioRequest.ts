export interface GenerateCurioRequest {
  topicId: string;
  topic: string;

  /**
   * Optional direction supplied by the editor.
   *
   * Example:
   * "Something surprising about memory"
   */
  direction?: string;
}
