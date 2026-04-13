# **PRODUCT REQUIREMENTS DOCUMENT**

## **Product Name: WRECTIFAI** 

---

# **1\. Product Overview**

**WRECTIFAI** is an AI-powered automotive assistance platform designed for the US market that enables users to:

* Diagnose vehicle issues using AI  
* Get DIY guidance for minor problems  
* Book trusted nearby garages (Rectifiers)  
* Purchase spare parts and DIY kits  
* Manage vehicle history and maintenance

The platform combines **AI diagnostics \+ service marketplace \+ e-commerce \+ booking \+ payments** into a unified ecosystem.

# **2\. Objectives**

* Reduce friction in identifying vehicle issues  
* Increase trust in garage selection  
* Enable quick service booking and payments  
* Create a marketplace for automotive parts  
* Build a data-driven vehicle lifecycle platform

# **3\. User Roles**

### **1\. Customers**

* Diagnose issues  
* Book garages  
* Buy spare parts  
* Manage vehicles  
* Manage appointments  
* Make Payments  
* Avail Offers  
* Browse History  
* Rate Garages  
* Manage profile, social login (Google, Apple), and notification preferences. Onboarding requires OTP, name and few details.

### **2\. Garages (Rectifiers)**

* Create profiles  
* Manage Appointments / Bookings  
* Offer services  
* Sell parts  
* Service history  
* Add Vehicles (no option to edit or delete)  
* Issue quotes

### **3\. Vendors**

* Sell spare parts  
* Manage inventory

### **4\. Admin**

* Approve garages/vendors  
* Manage platform  
* Monitor transactions

# **4\. Core Feature: AI Diagnosis**

### **Input Methods:**

* Text symptoms  
* Image upload  
* Video upload  
* Audio (engine sound)  
* Option to select from common symptoms (Noise, Vibration, Warning lights, Smell).  
* OBD / real-time diagnostics (AI automatically identifies issue via OBD plug,FUTURE RELEASE)

### **Guided Diagnostic Questions:**

System asks follow-up questions contextually based on the user's initial description to ensure relevance (e.g., if the issue is tire or brake related, the app should not ask engine related questions).

### **Output:**

* Display possible issues/services with a short explanation  
* AI must draft the quotation, suggesting specific spare parts and providing pricing for those spare parts.  
* For each suggestion, show: Urgency level and Risk if ignored  
* DIY steps (only for safe/minor issues)  
* Redirect to garages (for critical issues)  
* **Multi-Issue Handling:** Show multiple possible diagnoses and allow user to select the most relevant issue.  
* Allow user to raise issue, garages provide quotation , user can compare quotations and chose a garage

### **Rules:**

* No DIY guidance for high-risk issues  
* AI uses stored vehicle history for better accuracy

**5\. Vehicle Management**

* Mandatory onboarding step  
* Users can:  
  * Add multiple vehicles  
  * Option to upload VIN / Plate Number / RC for automatic data population (user must validate)  
  * **Required fields:** Make, Model, Year, Fuel Type  
  * **Optional fields:** Mileage, Trim, Engine type, VIN / Chassis  
  * Functionality to edit, delete, and set a default vehicle  
  * Store detailed past repair history (issue, service, shop, price, date) for future recommendations and discounts  
  * Add warranty details  
  * **Preventive Maintenance Suggestions:** Suggest services (Oil change, Tire rotation, yearly checkups, tire changes, gear oil, and brake oils etc.) based on Mileage, Time intervals, and Past repairs. Show urgency and recommended timeline.  
  * Previous History of the vehicle will not be captured , but AI will ask for it during diagnosis

# **6\. Garage (Rectifier) Ecosystem**

### **Onboarding:**

* Self-registration \+ Admin approval  
* Verification via:  
  * Documents  
  * Images  
  * Certifications

### **Features:**

* Prepare a Profile with:  
  * Specializations (Engine, EV, etc.)  
  * Business hours and Facility images/videos.  
  * Certifications  
* Availability & booking slots  
* Optional pickup & drop service  
* Appointment Management: User can select date/time, add notes, reschedule, and cancel appointments. Options for self check-in or a home pickup. Appointment reminders.  
* Garage can manage appointments ,Accept/Reject Bookings

### **Communication:**

User can call the shop directly or message the shop (optional in-app chat).

### **Booking Types:**

1. **Instant Booking**  
2. **Quote-Based System (Primary USP)**  
   * User raises request.  
   * Garages send quotes  
   * User selects one.  
   * Option to add desired garages to **favorites**.

# **7\. Payments & Monetization**

### **Payment Model:**

* Mandatory in-app payments (Card, Apple Pay, Google Pay)  
* Generate invoice/receipt and view payment history  
* System captures user details (e.g., name, address) during card detail entry/checkout flow.

### **7.1 AI-Based Price Estimation:**

Generate a fair repair cost based on vehicle, service, and location. Show specific breakdowns: Price range (min–max), Parts cost estimate, and Labor cost estimate, along with a Confidence level.

### **Revenue Streams:**

* Commission per booking  
* Listing fees for garages  
* Spare parts sales  
* Subscription:  
  * Premium users  
  * Subscription: All garages are required to subscribe to the platform.  
* Payment for the platform subscription/fee may be facilitated through the garage (e.g., deducted from commission).

**8\. Spare Parts Marketplace**

### **Sellers:**

* Platform (first-party)  
* Garages  
* Third-party vendors

### **Features:**

* AI-based part recommendations  
* DIY kits (e.g., brake repair kits)  
* Inventory \+ order management

### **Logistics:**

* Flexible:  
  * In-house delivery OR  
  * Third-party shipping integrations

# **9\. Ratings, Trust & Transparency System**

\- Show fair price estimate **before** booking.

\- Compare shop quotes directly to the fair price estimate and label quotes as: *Below market*, *Fair*, or *Above market*.

\- Build a shop trust score based on: **Pricing consistency** and **Complaint rate** (in addition to reviews).

* Star ratings \+ detailed feedback:  
  * Price  
  * Quality  
  * Time  
  * Behavior  
  * Specific option for users to **report overcharging or poor service**.  
* Only **verified users (post-booking)** can review

### **Badges:**

* Top Rated  
* Budget Friendly  
* EV Specialist


**10\. Discovery & Search**

* Auto location detection \+ manual search  
* Provide directions and show distance/travel time.

### **Filters:**

* Distance  
* Price  
* Rating  
* Specialization  
* Availability / Open now  
* Search by: Service, Vehicle, Shop name.

### **Shop Comparison:**

Functionality to compare multiple shops side-by-side, highlighting: Best value, Most trusted, and Closest. Provide Map view and List view.

### **AI Garage Recommender:**

AI analyzes submitted quotes and recommends the "best quotation" based on price, trust score, and other factors.

# **11\. Platform Scope**

* Mobile App (Primary)  
* Web App

### **Geography:**

* US Market (initial launch)  
* Non-functional requirements: Scaling capabilities, Multilanguage support, and Compliance with regulations for different countries.

# **12\. Future Roadmap (Phase 2+)**

* Predictive maintenance  
* OBD / real-time diagnostics (AI automatically identifies issue via OBD plug)  
* Chat with human mechanic  
* Emergency roadside assistance (garage-dependent)  
* Insurance integration  
* Payment chalans, Seconds marketplace, Insurance company tie-ups, Banks, Parking centers, and Gift vouchers.

# **13\. Integrations**

* Maps (location & navigation)  
* Payment gateway (US-supported like Stripe)  
* Notifications (SMS / email / push notifications via system engines)  
* Future: Car data APIs

# **14\. AI Architecture**

* Phase 1:  
  * LLM wrapper   
* Phase 2:  
  * Automotive-trained AI model  
  * Improved diagnosis accuracy

# **15\. Key Constraints & Policies**

* No unsafe DIY suggestions  
* Verified garage onboarding  
* Secure payments only via platform  
* Review authenticity enforcement

# **16\. User Journey (Simplified)**

### **Flow 1: Diagnosis → Fix**

1. User enters symptoms (text/image/audio/video)  
2. AI provides diagnosis \+ confidence  
3. If minor → DIY steps  
4. If major → show garages

### **Flow 2: Diagnosis → Booking**

1. User enters symptoms and AI provides diagnosis \+ draft quotation.  
2. User raises the issue request, and garages submit their quotes.  
3. User views garages, compares quotations with AI assistance, and selects the best suited option.  
4. User books an appointment with selected garage, choosing either self check-in or a home pickup option.  
5. Pays via app  
6. Service completed  
7. Leaves review

### **Flow 3: Parts Purchase**

1. AI suggests parts OR user searches  
2. User purchases  
3. Delivery fulfilled

# **17\. MVP Scope** 

### **Include:**

* AI diagnosis (basic)  
* Garage onboarding \+ booking  
* Quote system  
* Payments  
* Ratings  
* Basic marketplace

### **Exclude (later):**

* Predictive maintenance  
* Real-time diagnostics  
* Insurance  
* Roadside assistance

# **18\. Backend and Admin Systems**

### **18.1 Admin Panel (Backend System):**

* Manage users, shops, repair categories, pricing database, bookings, quotes, payments, complaints.   
* Analytics dashboard (Popular repairs, Average pricing, User growth, Revenue).   
* Manage **paid** ad space for garages (garages cannot advertise independently on the platform).  
* Loyalty Management: Manage "favorite customers" and push targeted offers to them. Coupon code mechanism for customers to avail offers.

### **18.2 Mechanic/Shop Dashboard:**

* Shop login/profile setup.   
* Manage services offered.   
* Set availability.   
* Accept/reject the bookings.   
* Send quotes.   
* View customer requests.   
* Manage appointments.   
* View reviews and ratings.   
* View detailed previous repair history of the vehicle (if available). 

**Internal Documentation Tool**: Option to document vehicle issues and service details internally (information is not shared with the customer). 

**Payment Module**: View and manage transaction and commission history.

# **19\. Analytics and Reporting (Business Side)**

* Total users, Total bookings, Quote conversion rate.  
* Most common repairs, Average repair cost by category, Shop performance metrics.   
* Active customers, Service quality metrics, and Location data.

# **20\. Security and Data Protection**

* Secure authentication  
* Encrypted user data  
* Secure payment processing  
* Role-based access (user, shop, admin)  
* Privacy policy and terms.