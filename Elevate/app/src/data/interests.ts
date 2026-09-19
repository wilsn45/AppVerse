export interface Interest {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const INTERESTS: Interest[] = [
  {id: 'blow-my-mind', label: 'Blow My Mind', emoji: '🤯', color: '#FFD7E4'},
  {id: 'psychology', label: 'Psychology', emoji: '🧠', color: '#DDD3FF'},
  {id: 'space', label: 'Space', emoji: '🪐', color: '#C9D9FF'},
  {id: 'science', label: 'Science', emoji: '🧪', color: '#C8F3E5'},
  {id: 'money', label: 'Money', emoji: '💸', color: '#DDF5C5'},
  {id: 'world', label: 'World', emoji: '🌍', color: '#CBEFFC'},
  {id: 'animals', label: 'Animals', emoji: '🦑', color: '#FFE0BE'},
  {id: 'technology', label: 'Technology', emoji: '🤖', color: '#D6E4FF'},
  {id: 'history', label: 'History', emoji: '🏺', color: '#F4D8B6'},
  {id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#FFD1F1'},
  {id: 'internet', label: 'Internet', emoji: '📱', color: '#D7D2FF'},
  {id: 'stories', label: 'Stories', emoji: '👀', color: '#FFE6AE'},
  {id: 'beautiful-things', label: 'Beautiful Things', emoji: '✨', color: '#D2F2EC'},
  {id: 'weird-stuff', label: 'Weird Stuff', emoji: '👽', color: '#D9F5BA'},
  {id: 'whats-happening', label: "What's Happening", emoji: '🔥', color: '#FFD5C8'},
];
