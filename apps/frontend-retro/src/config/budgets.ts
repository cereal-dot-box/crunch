// Budget bucket definitions and category mappings
// These can be customized per user in the future

export interface BudgetBucket {
  id: string;
  name: string;
  icon: string;
  monthlyLimit: number;
  categoryPatterns: string[]; // Plaid category patterns to match
  color: string;
}

export const DEFAULT_BUDGETS: BudgetBucket[] = [
  {
    id: 'food',
    name: 'Food',
    icon: '',
    monthlyLimit: 500,
    categoryPatterns: [
      'Food and Drink',
      'Restaurants',
      'Fast Food',
      'Coffee',
      'Groceries',
    ],
    color: 'bg-orange-500',
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: '',
    monthlyLimit: 600,
    categoryPatterns: [
      'Entertainment',
      'Recreation',
      'Movies',
      'Music',
      'Games',
      'Bars',
      'Nightlife',
      'Arts',
      'Sports',
      'Shopping',
      'Clothing',
      'Electronics',
      'General Merchandise',
      'Online Shopping',
      'Department Stores',
      'Transportation',
      'Gas',
      'Fuel',
      'Parking',
      'Public Transit',
      'Uber',
      'Lyft',
      'Taxi',
    ],
    color: 'bg-purple-500',
  },
];

// Helper function to map a transaction category to a budget bucket
export function categorizeToBucket(
  categoryName: string | null,
  categoryHierarchy: string | null
): string {
  if (!categoryName && !categoryHierarchy) return 'fun'; // Default to fun for uncategorized

  const searchText = `${categoryName || ''} ${categoryHierarchy || ''}`.toLowerCase();

  for (const bucket of DEFAULT_BUDGETS) {
    for (const pattern of bucket.categoryPatterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        return bucket.id;
      }
    }
  }

  return 'fun'; // Default to fun for uncategorized
}

// Calculate month-to-date date range
export function getMonthToDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // First day of current month
  const startDate = new Date(year, month, 1);

  // Today
  const endDate = now;

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// Preset color options for color picker
export const BUDGET_COLOR_OPTIONS = [
  { label: 'Gray', value: 'bg-gray-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Yellow', value: 'bg-yellow-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Indigo', value: 'bg-indigo-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Pink', value: 'bg-pink-500' },
];
