export const categoryImages: Record<string, string> = {
  psychology:
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=900&auto=format&fit=crop&q=80',

  space:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&auto=format&fit=crop&q=80',

  science:
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=80',

  money:
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&auto=format&fit=crop&q=80',

  world:
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=900&auto=format&fit=crop&q=80',

  animals:
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&auto=format&fit=crop&q=80',

  technology:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',

  history:
    'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=900&auto=format&fit=crop&q=80',

  entertainment:
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop&q=80',

  internet:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80',

  stories:
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&auto=format&fit=crop&q=80',

  'beautiful-things':
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80',

  'weird-stuff':
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',

  'blow-my-mind':
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&auto=format&fit=crop&q=80',

  'whats-happening':
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&auto=format&fit=crop&q=80',
};

export const imageForCategory = (
  categoryId: string,
): string =>
  categoryImages[categoryId] ??
  categoryImages['blow-my-mind'];
