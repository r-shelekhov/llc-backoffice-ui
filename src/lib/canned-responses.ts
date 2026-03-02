export interface CannedResponse {
  id: string;
  category: "greeting" | "follow_up" | "booking" | "closing" | "info_request";
  label: string;
  template: string;
}

export const cannedResponses: CannedResponse[] = [
  {
    id: "cr-1",
    category: "greeting",
    label: "Welcome",
    template: "Good day. Thank you for reaching out to LLC. How may I assist you today?",
  },
  {
    id: "cr-2",
    category: "greeting",
    label: "VIP Welcome",
    template: "Welcome back. It's a pleasure to assist you again. How may I be of service?",
  },
  {
    id: "cr-3",
    category: "info_request",
    label: "Need Details",
    template: "To proceed with your request, I'll need a few additional details. Could you please confirm the date, time, and number of passengers?",
  },
  {
    id: "cr-4",
    category: "info_request",
    label: "Request Itinerary",
    template: "Could you kindly share your itinerary or travel schedule? This will help us plan the optimal route and timing.",
  },
  {
    id: "cr-5",
    category: "booking",
    label: "Booking Confirmed",
    template: "Your booking has been confirmed. I'll send through the full details shortly, including driver information and vehicle specifications.",
  },
  {
    id: "cr-6",
    category: "booking",
    label: "Vehicle Options",
    template: "I have several excellent options available for your requested dates. Let me share the details so you can choose your preference.",
  },
  {
    id: "cr-7",
    category: "follow_up",
    label: "Following Up",
    template: "I wanted to follow up on our previous conversation. Do you have any updates or additional requirements?",
  },
  {
    id: "cr-8",
    category: "follow_up",
    label: "Awaiting Response",
    template: "Just a gentle reminder — we're still awaiting your confirmation to proceed. Please let us know at your earliest convenience.",
  },
  {
    id: "cr-9",
    category: "closing",
    label: "Thank You",
    template: "Thank you for choosing LLC. We look forward to providing you with an exceptional experience. Please don't hesitate to reach out if you need anything else.",
  },
  {
    id: "cr-10",
    category: "closing",
    label: "Trip Complete",
    template: "I hope everything met your expectations. It was a pleasure arranging this for you. We look forward to assisting you again soon.",
  },
];
