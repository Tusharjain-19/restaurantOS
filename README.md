<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/utensils-crossed.svg" alt="RestaurantOS" width="80" height="80" />
  
  # RestaurantOS 🚀

  **Next-Generation Offline-First Point of Sale & Restaurant Management System**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

<br />

RestaurantOS is a modern, ultra-fast, offline-first Point of Sale (POS) and Restaurant Management Web Application engineered for hospitality businesses. Built natively with modern web performance in mind, it provides robust capabilities ranging from deep-kitchen order tracking to comprehensive real-time Indian Rupee (₹) optimized analytics.

## ✨ Core Architecture & Features

| Feature | Description |
| :--- | :--- |
| **⚡ Advanced POS Terminal** | Lightning-fast billing module with integrated taxation (SGST/CGST), dynamic discounts, and cross-platform syncing. |
| **🛡️ Offline-First Resiliency** | Complete 100% functionality during internet outages. Local DBs synchronize operations without disruption. |
| **🎫 Dynamic KOTs** | Direct pipeline from POS to Kitchen queues with automated sequence mapping and lifecycle statuses. |
| **🪑 Spatial Table Flow** | Visual map of table occupancies, live order queuing, instant cart transfers, and split payment readiness. |
| **🖨️ Adaptive Receipt Formatting** | Native browser-printing automatically formats to standard **80mm** or **57mm** thermal roll bounds. |
| **💸 UPI Dynamic Intergration** | Scannable Dynamic QR codes mapping directly to exact Bill Totals tied to specific UPI ID configs. |
| **📊 Analytics Engine** | Deep dashboard intelligence tracking volume, peak-hour heatmaps, table turnover, & sales breakdowns. |

<br />

## 💻 Tech Stack Overview

- **Frontend Core**: React 18 / TypeScript
- **Bundler**: Vite (Optimized production builds)
- **Styling**: Tailwind CSS / Custom CSS3 Print Rules
- **UI Architecture**: Component-driven Shadcn UI design
- **State & Database**: Dexie.js (IndexedDB wrapper for instantaneous persistent browser local storage)
- **Iconography System**: Lucide React 

## 💰 Pricing & Distribution Model

RestaurantOS is designed for direct white-label distribution. Below is the recommended pricing structure for restaurant owners:

| Plan | Pricing | Features |
| :--- | :--- | :--- |
| **7-Day Free Trial** | ₹0 | Full feature access to test operations and thermal printing compatibility. |
| **Monthly Subscription** | ₹1,299/mo | All features + Support. Ideal for seasonal or new businesses. |
| **Yearly Subscription** | ₹11,999/yr | **Best Value**. Includes 25% discount and priority remote support. |
| **Lifetime License** | ₹24,999 | One-time buyout for permanent offline use + minor updates. |
| **Annual Renewal (AMC)**| ₹4,999/yr | For technical maintenance, security updates, and cloud sync. |

## 📑 Advanced Invoice Designer

The system features a Canva-inspired **Invoice Designer** that allows owners to:
- **Dynamic Content**: Edit headers, footers, and legal declarations.
- **Visual Control**: Toggle logo visibility, font weights, and text alignment.
- **Thermal Optimization**: Real-time previews for 80mm and 57mm paper rolls.
- **Legal Compliance**: Add GSTIN, FSSAI licenses, and custom terms & conditions directly.

## 🚀 Getting Started

To get a local development environment up and running smoothly, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16.14.0 or higher)
- npm or yarn packet manager

### Installation Procedure

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tusharjain-19/restaurantOS.git
   cd restaurantOS
   ```

2. **Install dependencies safely**
   ```bash
   npm install
   ```

3. **Initialize the local server**
   ```bash
   npm run dev
   ```

4. **Launch**  
   Navigate to `http://localhost:5173/` in your browser. The system will auto-initialize a fresh local DB registry on the first run.

<br />

## 🔐 Security & Privacy Architecture

By default, all sensitive transactional data—such as sequential daily revenue, staff role definitions, customer order histories, and proprietary items—are stored strictly on the terminal's **Local IndexedDB**. Continuous Sequence Generative logic perfectly isolates tokens, clearing sequence boundaries accurately every day at `12:00 AM`.

<br />

## 👨‍💻 Project Authors & Contributions

This project is actively maintained and designed under extreme precision to revolutionize the standard of Food & Beverage Management software.

- **Tushar Jain** - *Lead Developer, Architect & UI/UX Designer* 
  - [Portfolio (tusharjain.in)](https://tusharjain.in)
  - [GitHub Profile](https://github.com/Tusharjain-19)

### 🙌 Acknowledgements & Contributors
- **Niranjan K** - *Contributor*
  - [GitHub Profile](https://github.com/Niranjan-png)

---
<div align="center">
  <i>Developed proudly by Tushar Jain</i>
</div>