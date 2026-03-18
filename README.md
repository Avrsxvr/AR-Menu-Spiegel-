# AR Menu UI - Mobile-First React Application

A modern, dark, and sleek mobile-first React application for restaurant menu browsing with AR/3D integration placeholders.

## 🚀 Features

- **Mobile-First Design**: Optimized for phones with responsive breakpoints
- **Dark Theme**: Modern dark UI with red accents matching the DAALCHINI brand
- **Client-Side Filtering**: Filter dishes by category with smooth transitions
- **Lazy Loading**: Images load efficiently using Intersection Observer
- **Accessibility**: Full keyboard navigation and screen reader support
- **AR/3D Ready**: Modal placeholders for future 3D and AR integration
- **Performance Optimized**: Skeleton loading states and smooth animations

## 📱 Responsive Breakpoints

- **Mobile**: 1 column grid (default)
- **Tablet**: 2 column grid (768px+)
- **Desktop**: 3 column grid (1024px+)

## 🛠 Tech Stack

- **React 18** - Functional components with hooks
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **CSS Custom Properties** - Theme variables

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Restaurant name and hamburger menu
│   ├── FilterPills.jsx         # Category filter pills
│   ├── DishCard.jsx           # Individual dish card component
│   ├── SkeletonCard.jsx       # Loading placeholder
│   └── ModelPlaceholderModal.jsx # 3D/AR modal placeholder
├── App.jsx                    # Main application component
├── main.jsx                   # React entry point
└── index.css                  # Global styles and CSS variables

public/
└── dishes.json               # Sample menu data (15 dishes)
```

## 🎨 Design System

### CSS Variables
```css
--bg: #0f0f0f              /* Main background */
--card-bg: #1a1a1a         /* Card backgrounds */
--accent: #DC2626          /* Primary red accent */
--accent-hover: #B91C1C    /* Hover state */
--text-primary: #ffffff    /* Primary text */
--text-secondary: #a3a3a3  /* Secondary text */
--text-muted: #737373      /* Muted text */
--border: #262626          /* Border color */
--radius: 16px             /* Card border radius */
--radius-sm: 8px           /* Small border radius */
```

### Component Props for Future 3D/AR Integration

The `ModelPlaceholderModal` component is designed to be easily replaceable with actual 3D/AR functionality:

```jsx
<ModelPlaceholderModal
  isOpen={boolean}
  onClose={function}
  dish={dishObject}
  viewType="3d" | "ar"
  // Future props for 3D integration:
  // modelGlbUrl={string}
  // modelUsdzUrl={string}
/>
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui
```

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: ARIA labels and proper alt text
- **Focus Management**: Modal focus trapping and visible focus indicators
- **Touch Targets**: Minimum 44px touch targets for mobile usability

## 📱 Mobile Optimizations

- **Touch-Friendly**: Large touch targets and smooth interactions
- **Fast Loading**: Image lazy loading and skeleton states
- **Smooth Scrolling**: Custom scrollbar styling and smooth animations
- **Gesture Support**: Swipe-friendly horizontal filter scrolling

## 🔧 Development Notes

### Adding New Dishes
Edit `public/dishes.json` with the following structure:
```json
{
  "id": "unique-dish-id",
  "name": "Dish Name",
  "description": "One-line description of the dish",
  "category": "Starters|Main Course|Rice|Breads|Desserts",
  "meta": "Serving info • Spice level 🌶️",
  "price": 399,
  "image": "https://images.unsplash.com/photo-id?w=400&h=300&fit=crop"
}
```

### Integrating 3D/AR Models
1. Replace `ModelPlaceholderModal` with your 3D viewer component
2. Pass `modelGlbUrl` and `modelUsdzUrl` props
3. Handle WebXR/AR.js integration in the modal component
4. Update button handlers in `DishCard` component

## 🚀 Deployment

This application is ready for static site deployment on platforms like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

Simply run `npm run build` and deploy the `dist` folder.

## 🎯 Performance

- **Bundle Size**: Optimized for minimal initial load
- **Image Optimization**: Lazy loading with Intersection Observer
- **CSS**: Utility-first approach with CSS custom properties
- **JavaScript**: Modern ES6+ with tree shaking

## 📄 License

MIT License - Feel free to use this project for your restaurant or modify as needed.