# Ghumo Design System — Project Emoji Inventory & Vector Icon Replacement Mapping

This document catalogs every emoji currently used across the **Ghumo Frontend** application alongside its exact recommended `@expo/vector-icons` replacement (using **Ionicons**, **Feather**, **MaterialCommunityIcons**, or **FontAwesome5**).

---

## 🗺️ 1. Category & Exploration Icons

| Emoji | Name / Context | Current Usages | Recommended React Native Icon | Icon Pack |
| :--- | :--- | :--- | :--- | :--- |
| **📍** | Location Pin | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx`, `SearchView.tsx`, `PromptView.tsx`, `MapBackground.tsx` | `<Ionicons name="location-sharp" size={size} color={color} />` | `Ionicons` |
| **🍲** | Food / Chaat Stop | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx`, `SearchView.tsx`, `PromptView.tsx` | `<Ionicons name="restaurant-outline" size={size} color={color} />` | `Ionicons` |
| **🛍️** | Markets / Shopping | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx`, `SearchView.tsx` | `<Feather name="shopping-bag" size={size} color={color} />` | `Feather` |
| **🏛️** | Monuments / Heritage | `DynamicBottomBar.tsx`, `PromptView.tsx` | `<FontAwesome5 name="landmark" size={size} color={color} />` | `FontAwesome5` |
| **💎** | Hidden Gems / Treasures | `DynamicBottomBar.tsx`, `SearchView.tsx` | `<Ionicons name="diamond-outline" size={size} color={color} />` | `Ionicons` |
| **💡** | Travel Tips / Advice | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx`, `PromptView.tsx` | `<Ionicons name="bulb-outline" size={size} color={color} />` | `Ionicons` |
| **🏰** | Forts / Royal Palaces | `PromptView.tsx`, `AIPromptExpandedSheet.tsx`, `MapPlaceCarousel.tsx` | `<MaterialCommunityIcons name="castle" size={size} color={color} />` | `MaterialCommunityIcons` |
| **🌊** | Lakes / Scenic Sunsets | `PromptView.tsx`, `AIPromptExpandedSheet.tsx` | `<MaterialCommunityIcons name="wave" size={size} color={color} />` | `MaterialCommunityIcons` |
| **🎒** | Backpacking / Trekking | `AIPromptExpandedSheet.tsx` | `<Ionicons name="backpack-outline" size={size} color={color} />` | `Ionicons` |
| **📸** | Photography / Sightseeing | `AIPromptExpandedSheet.tsx` | `<Feather name="camera" size={size} color={color} />` | `Feather` |
| **🍛** | Street Food & Cuisine | `PromptView.tsx`, `SearchView.tsx` | `<MaterialCommunityIcons name="noodles" size={size} color={color} />` | `MaterialCommunityIcons` |
| **🛕** | Shrines / Spiritual | `SearchView.tsx` | `<MaterialCommunityIcons name="temple-hindu" size={size} color={color} />` | `MaterialCommunityIcons` |

---

## 🤖 2. AI Planner, Schedules & Interaction Badges

| Emoji | Name / Context | Current Usages | Recommended React Native Icon | Icon Pack |
| :--- | :--- | :--- | :--- | :--- |
| **✨** | Sparkles / AI Magic | `PromptView.tsx`, `AIPromptExpandedSheet.tsx`, `SearchView.tsx` | `<Ionicons name="sparkles" size={size} color={color} />` | `Ionicons` |
| **📅** | Day Schedule / Calendar | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx` | `<Feather name="calendar" size={size} color={color} />` | `Feather` |
| **⏰** | Time Slot / Timings | `MapPlaceCarousel.tsx`, `SearchView.tsx` | `<Feather name="clock" size={size} color={color} />` | `Feather` |
| **🕐** | Recent History | `PromptView.tsx`, `SearchView.tsx` | `<Feather name="history" size={size} color={color} />` | `Feather` |
| **💰** | Budget / Estimated Cost | `DynamicBottomBar.tsx`, `MapPlaceCarousel.tsx`, `PromptView.tsx`, `SearchView.tsx`, `HomeFeedResults.tsx` | `<FontAwesome5 name="money-bill-wave" size={size} color={color} />` | `FontAwesome5` |
| **🏨** | Hotel / Accommodation | `HomeFeedResults.tsx` | `<Ionicons name="bed-outline" size={size} color={color} />` | `Ionicons` |
| **🎟️** | Activities / Ticket Price | `HomeFeedResults.tsx`, `SearchView.tsx` | `<Ionicons name="ticket-outline" size={size} color={color} />` | `Ionicons` |
| **🚕** | Transit / Transport | `HomeFeedResults.tsx` | `<Ionicons name="car-outline" size={size} color={color} />` | `Ionicons` |
| **🍽️** | Must-Try Dining | `SearchView.tsx` | `<MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />` | `MaterialCommunityIcons` |
| **🔄** | Refresh / Refetch Cache | `DynamicBottomBar.tsx`, `homeContext.tsx` | `<Feather name="refresh-cw" size={size} color={color} />` | `Feather` |

---

## ⭐ 3. Ratings, Navigation & UI Controls

| Emoji | Name / Context | Current Usages | Recommended React Native Icon | Icon Pack |
| :--- | :--- | :--- | :--- | :--- |
| **★** | Star Rating | `MapPlaceCarousel.tsx`, `MapBackground.tsx`, `SearchView.tsx` | `<Ionicons name="star" size={size} color={color} />` | `Ionicons` |
| **📎** | File Attachment | `PromptView.tsx`, `AIPromptExpandedSheet.tsx`, `AttachmentPickerView.tsx` | `<Feather name="paperclip" size={size} color={color} />` | `Feather` |
| **🔥** | Hot Destinations / Trends | `HomeFeedResults.tsx` | `<Ionicons name="flame" size={size} color={color} />` | `Ionicons` |
| **✕** | Close / Minimize | `MapPlaceCarousel.tsx`, `PromptView.tsx`, `SearchView.tsx`, `AppErrorBanner.tsx` | `<Feather name="x" size={size} color={color} />` | `Feather` |

---

## 🛠️ 4. System Logs & Debug Utilities

| Emoji | Name / Context | Current Usages | Recommended React Native Icon | Icon Pack |
| :--- | :--- | :--- | :--- | :--- |
| **ℹ️** | Info Log | `logger.ts` | `<Feather name="info" size={size} color={color} />` | `Feather` |
| **⚠️** | Warning Log | `logger.ts` | `<Feather name="alert-triangle" size={size} color={color} />` | `Feather` |
| **🚨** | Error Log | `logger.ts` | `<Ionicons name="alert-circle-outline" size={size} color={color} />` | `Ionicons` |
| **🔍** | Search Query Icon | `logger.ts`, `SearchView.tsx` | `<Feather name="search" size={size} color={color} />` | `Feather` |
