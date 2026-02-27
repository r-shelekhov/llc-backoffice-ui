import type { InternalNote } from "@/types";

export const internalNotes: InternalNote[] = [
  // Notes for conv-1 (Ashworth airport transfer)
  {
    id: "note-1",
    conversationId: "conv-1",
    authorId: "usr-3",
    content: "IMPORTANT: Mr. Ashworth requires Krug Grande Cuvée specifically — not Dom Pérignon. He was very particular about this last time. Temperature must be exactly 8°C. Heinrich confirmed and briefed on all protocols.",
    createdAt: "2026-01-14T10:15:00Z",
    updatedAt: "2026-01-14T10:15:00Z",
  },
  {
    id: "note-2",
    conversationId: "conv-1",
    authorId: "usr-1",
    content: "Security team at Grosvenor Square requires 30-minute advance notice of arrival. Contact: Mike Donovan +44 20 7946 0958. Gate code changes monthly — verify before dispatch.",
    createdAt: "2026-01-14T11:00:00Z",
    updatedAt: "2026-01-14T11:00:00Z",
  },
  // Notes for conv-2 (Ashworth jet charter)
  {
    id: "note-3",
    conversationId: "conv-2",
    authorId: "usr-3",
    content: "Client strongly prefers tail G-LUXE — same aircraft used in November. Operator confirmed availability. Dorchester catering contact: Chef Williams direct line. He knows Mr. Ashworth's preferences (no wasabi, extra toro, specific champagne: Krug Grande Cuvée). Newcastle trip.",
    createdAt: "2026-02-10T15:00:00Z",
    updatedAt: "2026-02-10T15:00:00Z",
  },
  {
    id: "note-4",
    conversationId: "conv-2",
    authorId: "usr-4",
    content: "Newcastle ground transport: Two black Range Rover Sports confirmed with Newcastle Luxury Cars. Driver briefed to wait at FBO, not on tarmac. Luggage will need the extended cargo configuration.",
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-02-12T09:00:00Z",
  },
  // Notes for conv-4 (Lady Beaumont wedding fleet)
  {
    id: "note-5",
    conversationId: "conv-4",
    authorId: "usr-4",
    content: "Wedding fleet: All 4 Phantoms MUST be Arctic White (not Andalusian White — client can tell the difference). Ribbons: Pantone 11-0604 TCX. Confirmed with McQueens Flowers — arrangements will be peonies and garden roses, installed 7-9 AM day of.",
    createdAt: "2026-01-11T08:00:00Z",
    updatedAt: "2026-01-11T08:00:00Z",
  },
  {
    id: "note-6",
    conversationId: "conv-4",
    authorId: "usr-1",
    content: "Route approved by Metropolitan Police traffic division. Red light priority at 3 junctions granted. Backup route via Embankment if there's unexpected road closure. Rehearsal drive completed on Jan 18 — timing is exactly 18 minutes.",
    createdAt: "2026-01-18T16:00:00Z",
    updatedAt: "2026-01-18T16:00:00Z",
  },
  // Notes for conv-5 (Sheikh yacht charter)
  {
    id: "note-7",
    conversationId: "conv-5",
    authorId: "usr-3",
    content: "Eclipse II confirmed pending master suite modifications. Budget for refit: approximately £155,000. Sheikh's designer (Layla Al-Rashid) has not yet sent specifications. This is blocking the entire refit timeline. Must receive by Feb 25 or we risk missing the Cowes Week deadline.",
    createdAt: "2026-02-08T09:00:00Z",
    updatedAt: "2026-02-24T16:30:00Z",
  },
  {
    id: "note-8",
    conversationId: "conv-5",
    authorId: "usr-3",
    content: "Michelin chef shortlist: 1) Chef Tom Kerridge (2-star, available), 2) Chef Nathan Outlaw (2-star, tentative), 3) Chef Simon Rogan (2-star, confirmed backup). All have superyacht experience. Sheikh's dietary requirements: strictly halal, no pork, no alcohol in cooking.",
    createdAt: "2026-02-10T14:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  // Notes for conv-7 (Isabelle Fashion Week)
  {
    id: "note-9",
    conversationId: "conv-7",
    authorId: "usr-4",
    content: "Pierre (chauffeur) confirmed for full Fashion Week. He drove Mme de Montfort last season and knows all venue entrances, including the back entrance at Somerset House that avoids paparazzi. Garment bag storage: boot fitted with hanging rail system.",
    createdAt: "2026-02-06T09:00:00Z",
    updatedAt: "2026-02-06T09:00:00Z",
  },
  {
    id: "note-10",
    conversationId: "conv-7",
    authorId: "usr-3",
    content: "Fashion Week schedule changes rapidly — Pierre should expect last-minute rerouting. Mme de Montfort gets stressed about punctuality. Always arrive 10 minutes early. Keep Evian and macarons (Ladurée rose flavour only) stocked daily.",
    createdAt: "2026-02-07T11:00:00Z",
    updatedAt: "2026-02-07T11:00:00Z",
  },
  // Notes for conv-14 (Mei Lin jet)
  {
    id: "note-11",
    conversationId: "conv-14",
    authorId: "usr-3",
    content: "Crew confirmed: Captain Henderson, First Officer McLeod. Catering: No shellfish for passengers 2 and 3. Chinese tea service (Tie Guan Yin specifically) instead of standard coffee service.",
    createdAt: "2026-02-23T08:00:00Z",
    updatedAt: "2026-02-23T08:00:00Z",
  },
  // Notes for conv-18 (Kensington celebrity event)
  {
    id: "note-12",
    conversationId: "conv-18",
    authorId: "usr-4",
    content: "STRICT NDA applies to all drivers. Celebrity names must not be shared externally. Arrival timing: 30-second intervals between vehicles at the red carpet. PR team (Jessica Hall) will radio timing cues. All three Phantoms must have maximum tint — factory privacy glass confirmed.",
    createdAt: "2026-02-13T10:00:00Z",
    updatedAt: "2026-02-13T10:00:00Z",
  },
  {
    id: "note-13",
    conversationId: "conv-18",
    authorId: "usr-1",
    content: "V&A security team needs driver IDs 48 hours in advance. Parking in the service area behind Exhibition Road. Only NDA-cleared staff to be within 50m of drop-off zone. Insurance rider for celebrity damage coverage activated.",
    createdAt: "2026-02-14T15:00:00Z",
    updatedAt: "2026-02-14T15:00:00Z",
  },
  // Notes for conv-21 (Okafor Stansted)
  {
    id: "note-14",
    conversationId: "conv-21",
    authorId: "usr-4",
    content: "Standard meet and greet arranged at Stansted arrivals. Driver James assigned — experienced with City routes. Primary route: M11 → A12 → City. Backup via A406 if there's traffic on the M11.",
    createdAt: "2026-02-20T14:00:00Z",
    updatedAt: "2026-02-20T14:00:00Z",
  },
  // Notes for conv-23 (Ashworth Mediterranean yacht)
  {
    id: "note-15",
    conversationId: "conv-23",
    authorId: "usr-3",
    content: "Captain Morrison confirmed — he was delighted to hear about the repeat Solent booking. Upgrading tender from 30ft to 40ft Riva requires swapping the davit crane. Cost: additional £45,000 for the charter period. Water toys package (Jet Skis, Seabobs, paddleboards, Flyboard) = £18,000.",
    createdAt: "2026-02-15T11:00:00Z",
    updatedAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "note-16",
    conversationId: "conv-23",
    authorId: "usr-3",
    content: "Children ages 8 and 11 joining. Youth entertainment coordinator: booking Sophia Maxwell (worked on 'Ocean Dream' charter previously). Need child-size life jackets, water safety briefing. Mrs. Ashworth wants a 'top-tier' spa therapist — contacting Aman Spa for their best available.",
    createdAt: "2026-02-16T15:00:00Z",
    updatedAt: "2026-02-16T15:00:00Z",
  },
  // Notes for conv-6 (Sheikh BBJ)
  {
    id: "note-17",
    conversationId: "conv-6",
    authorId: "usr-1",
    content: "BBJ charter for 20 pax is a significant booking — estimated £380,000+. Need to source from our UK operators first. Al Reef Catering contact: +44 161 123 4567. They have the Sheikh's standing order on file. Bedroom suite with full en-suite bathroom is mandatory.",
    createdAt: "2026-02-24T12:00:00Z",
    updatedAt: "2026-02-24T12:00:00Z",
  },
  // Notes for conv-9 (Harrington Heathrow)
  {
    id: "note-18",
    conversationId: "conv-9",
    authorId: "usr-3",
    content: "Standard transfer — no special requirements. Client is a repeat customer. Prefers quiet rides (no small talk). Water bottle in rear cup holder. Driver: Antonio.",
    createdAt: "2026-01-17T08:00:00Z",
    updatedAt: "2026-01-17T08:00:00Z",
  },
  // Notes for conv-3 (Lady Beaumont helicopter)
  {
    id: "note-19",
    conversationId: "conv-3",
    authorId: "usr-3",
    content: "Lady Beaumont is very particular about helicopter models. AW139 only — she considers the H145 'too cramped.' Return flight at midnight means we need to confirm night-flying permissions at Goodwood. Her usual box at the racecourse should be arranged.",
    createdAt: "2026-02-19T09:00:00Z",
    updatedAt: "2026-02-19T09:00:00Z",
  },
  // Notes for conv-15 (Mei Lin car)
  {
    id: "note-20",
    conversationId: "conv-15",
    authorId: "usr-4",
    content: "Still waiting on Ms Zhang's itinerary. Reminder sent on Feb 24. If not received by Feb 27, we'll need to escalate — the driver needs at least 3 days to plan routes across the City and West End. Traffic in those areas can be severe during March business season.",
    createdAt: "2026-02-24T11:30:00Z",
    updatedAt: "2026-02-24T11:30:00Z",
  },
  {
    id: "note-21",
    conversationId: "conv-11",
    authorId: "usr-4",
    content: "Ms Petrova confirmed: still water (Highland Spring preferred) and light snacks (mixed nuts, dried fruit, no chocolate). Driver James is assigned — experienced with Cotswolds routes. Soho Farmhouse gate code to be collected day of from concierge.",
    createdAt: "2026-02-21T09:00:00Z",
    updatedAt: "2026-02-21T09:00:00Z",
  },
  {
    id: "note-22",
    conversationId: "conv-20",
    authorId: "usr-3",
    content: "First-time client. Standard BMW 7 Series transfer. Virginia Water is about 40-50 min from Heathrow depending on traffic. Evening arrival should be smoother. No special requirements noted — treat as a standard premium transfer with excellent service to encourage repeat business.",
    createdAt: "2026-02-25T09:30:00Z",
    updatedAt: "2026-02-25T09:30:00Z",
  },
];
