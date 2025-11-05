# 🚀 Retrofit Mobile App

**Transform job site visits into professional quotes in 15 minutes, guaranteed.**

The Retrofit mobile app is a powerful tool for insulation contractors that streamlines the entire quote creation process—from on-site photo capture to instant PDF generation and client sharing. Built with cutting-edge React Native and Expo technology, it syncs seamlessly with the Retrofit web platform.

## ⚡ What Makes This Special

### ⏱️ **15-Minute Quote Creation**
Gone are the days of spending hours on quotes. Our intuitive 5-step flow gets you from job site to signed quote in record time:
1. **Details** - Capture client and project information
2. **Photos** - Snap or upload photos directly from your device
3. **Items** - List billable items with smart area/quantity calculations
4. **Costs** - Assign prices with preset materials or custom rates
5. **Summary** - Review, generate PDF, and share instantly

### 📱 **Native Mobile Experience**
- **Camera Integration** - Take photos on-site with built-in camera
- **Offline-Ready** - Works even when connectivity is spotty
- **Touch-Optimized** - Large buttons and inputs designed for field use
- **Real-Time Sync** - All data syncs automatically with your web dashboard

### 💼 **Professional Features**
- **Smart Calculations** - Automatic area/quantity × price calculations
- **PDF Generation** - Professional invoices matching your brand
- **Material Library** - Save and reuse your most common materials
- **Quote Management** - Search, filter, and manage all quotes in one place
- **Rebate Lookup** - Automatic rebate calculations based on location

## 🎯 Key Features

### Dashboard
- Welcome screen with quick stats
- Recent quotes at a glance
- Quick access to create new quotes
- Real-time revenue tracking

### Quote Creation Flow
- **Smart Item Management** - Add rooms, labor, materials, services, or custom items
- **Auto-Calculations** - Room areas calculated from length × width
- **Flexible Pricing** - Direct input or choose from saved presets
- **Photo Management** - Multiple photos per quote with gallery support
- **Instant PDF** - Generate professional invoices with one tap
- **Easy Sharing** - Share quotes via SMS, email, or any app

### Quote Management
- Search by client name, project, or address
- Filter by status (Draft, Sent, Approved)
- View all quotes with full details
- Quick actions for each quote

### Settings & Customization
- Company profile management
- Materials library with custom rates
- Notification preferences
- Unit system (Imperial/Metric)

## 🛠️ Tech Stack

Built with modern, battle-tested technologies:

- **React Native 0.81** - Native mobile performance
- **Expo 54** - Rapid development and deployment
- **TypeScript** - Type-safe code for reliability
- **Expo Router** - File-based routing
- **Supabase** - Real-time backend via Lovable Cloud
- **Expo Print** - Professional PDF generation
- **Expo Image Picker** - Native camera and gallery access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone (iOS/Android)
- Or Xcode (iOS) / Android Studio (Android) for development builds

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nilay-goyal/Retrofit_app-v2.git
   cd Retrofit_app-v2/REACT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure backend (optional):**
   The app comes pre-configured with Lovable Cloud credentials. To use your own:
   - Edit `lib/supabase/client.ts`, or
   - Create a `.env` file:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on your device:**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go
   - **Web**: Press `w`

## 📁 Project Structure

```
REACT/
├── app/
│   ├── (tabs)/              # Main app screens
│   │   ├── index.tsx        # Dashboard
│   │   ├── new-quote.tsx    # 5-step quote creation
│   │   ├── quotes.tsx       # All quotes view
│   │   └── settings.tsx     # Profile & preferences
│   ├── auth.tsx             # Authentication
│   └── _layout.tsx          # Root layout
├── hooks/
│   ├── useAuth.tsx          # Authentication logic
│   ├── useQuotes.tsx        # Quote management
│   └── useSettings.tsx      # User settings
└── lib/
    └── supabase/            # Backend client & types
```

## 🔌 Backend Integration

The app connects to **Lovable Cloud (Supabase)** and syncs with your Retrofit web app:

- **Authentication** - Email/password sign up and sign in
- **Real-Time Sync** - Quotes, profiles, and settings sync instantly
- **Database Tables:**
  - `quotes` - All quote data
  - `profiles` - User profiles and company info
  - `quote_photos` - Photo attachments
  - `quote_measurements` - Measurement data
  - `rebates` - Rebate information

See `BACKEND_INTEGRATION.md` for detailed API documentation.

## 🎨 Design Philosophy

- **Field-First** - Designed for use on job sites with gloves
- **Touch-Friendly** - Large buttons (56px minimum) and touch targets
- **Professional** - Clean, modern interface that clients will trust
- **Brand Colors** - Consistent green (#7cd35c) throughout

## 📱 Supported Platforms

- ✅ iOS (iPhone/iPad)
- ✅ Android
- ✅ Web (via Expo)

## 🐛 Troubleshooting

**App won't start?**
```bash
npx expo start --clear
```

**Metro bundler issues?**
```bash
npx expo start --reset-cache
```

**Authentication not working?**
- Check your internet connection
- Verify Supabase credentials in `lib/supabase/client.ts`
- Ensure RLS policies allow your user access

**PDF not generating?**
- Ensure you have storage permissions
- Check that `expo-print` is properly installed

**Photos not uploading?**
- Grant camera and photo library permissions
- Check device storage space

## 🚧 Roadmap

- [ ] Offline mode with sync queue
- [ ] Multi-user team support
- [ ] Advanced rebate calculations
- [ ] Customer portal integration
- [ ] Payment processing
- [ ] QuickBooks integration

## 📄 License

CC-BY-4.0

## 🤝 Contributing

Contributions welcome! This is an active project for insulation contractors. Feel free to open issues or submit pull requests.

---

**Built with ❤️ for contractors who value their time.**

*From job site to signed quote in 15 minutes, guaranteed.*
