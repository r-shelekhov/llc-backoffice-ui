import type { InternalNote } from "@/types";

export const internalNotes: InternalNote[] = [
  // Notes for req-1 (Rothschild airport transfer)
  {
    id: "note-1",
    requestId: "req-1",
    authorId: "usr-3",
    content: "IMPORTANT: Mr. Rothschild requires Krug Grande Cuvée specifically — not Dom Pérignon. He was very particular about this last time. Temperature must be exactly 8°C. Heinrich confirmed and briefed on all protocols.",
    createdAt: "2026-01-14T10:15:00Z",
    updatedAt: "2026-01-14T10:15:00Z",
  },
  {
    id: "note-2",
    requestId: "req-1",
    authorId: "usr-1",
    content: "Security team at 432 Park requires 30-minute advance notice of arrival. Contact: Mike Donovan +1 212 555 9999. Gate code changes monthly — verify before dispatch.",
    createdAt: "2026-01-14T11:00:00Z",
    updatedAt: "2026-01-14T11:00:00Z",
  },
  // Notes for req-2 (Rothschild jet charter)
  {
    id: "note-3",
    requestId: "req-2",
    authorId: "usr-3",
    content: "Client strongly prefers tail N650GX — same aircraft used in November. Operator confirmed availability. Nobu catering contact: Chef Yamamoto direct line. He knows Mr. Rothschild's preferences (no wasabi, extra toro, specific sake brand: Dassai 23).",
    createdAt: "2026-02-10T15:00:00Z",
    updatedAt: "2026-02-10T15:00:00Z",
  },
  {
    id: "note-4",
    requestId: "req-2",
    authorId: "usr-4",
    content: "Aspen ground transport: Two black Escalade ESVs confirmed with Aspen Luxury Cars. Driver briefed to wait at FBO, not on tarmac. Ski equipment will need the extended cargo configuration.",
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-02-12T09:00:00Z",
  },
  // Notes for req-4 (Victoria wedding fleet)
  {
    id: "note-5",
    requestId: "req-4",
    authorId: "usr-4",
    content: "Wedding fleet: All 4 Phantoms MUST be Arctic White (not Andalusian White — client can tell the difference). Ribbons: Pantone 11-0604 TCX. Confirmed with florist Moens — arrangements will be peonies and garden roses, installed 7-9 AM day of.",
    createdAt: "2026-01-11T08:00:00Z",
    updatedAt: "2026-01-11T08:00:00Z",
  },
  {
    id: "note-6",
    requestId: "req-4",
    authorId: "usr-2",
    content: "Route approved by HKPF traffic division. Red light priority at 3 intersections granted. Backup route via Garden Road if there's unexpected road closure. Rehearsal drive completed on Jan 18 — timing is exactly 22 minutes.",
    createdAt: "2026-01-18T16:00:00Z",
    updatedAt: "2026-01-18T16:00:00Z",
  },
  // Notes for req-5 (Sheikh yacht charter)
  {
    id: "note-7",
    requestId: "req-5",
    authorId: "usr-3",
    content: "Eclipse II confirmed pending master suite modifications. Budget for refit: approximately €180,000. Sheikh's designer (Layla Al-Rashid) has not yet sent specifications. This is blocking the entire refit timeline. Must receive by Feb 25 or we risk missing the Monaco deadline.",
    createdAt: "2026-02-08T09:00:00Z",
    updatedAt: "2026-02-24T16:30:00Z",
  },
  {
    id: "note-8",
    requestId: "req-5",
    authorId: "usr-3",
    content: "Michelin chef shortlist: 1) Chef Pierre Gagnaire (3-star, available), 2) Chef Alain Passard (3-star, tentative), 3) Chef Mauro Colagreco (3-star, confirmed backup). All have superyacht experience. Sheikh's dietary requirements: strictly halal, no pork, no alcohol in cooking.",
    createdAt: "2026-02-10T14:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  // Notes for req-7 (Isabelle Fashion Week)
  {
    id: "note-9",
    requestId: "req-7",
    authorId: "usr-4",
    content: "Pierre (chauffeur) confirmed for full Fashion Week. He drove Mme de Montfort last season and knows all venue entrances, including the back entrance at Grand Palais that avoids paparazzi. Garment bag storage: boot fitted with hanging rail system.",
    createdAt: "2026-02-06T09:00:00Z",
    updatedAt: "2026-02-06T09:00:00Z",
  },
  {
    id: "note-10",
    requestId: "req-7",
    authorId: "usr-5",
    content: "Fashion Week schedule changes rapidly — Pierre should expect last-minute rerouting. Mme de Montfort gets stressed about punctuality. Always arrive 10 minutes early. Keep Evian and macarons (Ladurée rose flavor only) stocked daily.",
    createdAt: "2026-02-07T11:00:00Z",
    updatedAt: "2026-02-07T11:00:00Z",
  },
  // Notes for req-14 (Mei Lin jet)
  {
    id: "note-11",
    requestId: "req-14",
    authorId: "usr-5",
    content: "Crew confirmed: Captain Li Wei (Mandarin-native), First Officer Tanaka (Japanese/Mandarin bilingual). Catering: No shellfish for passengers 2 and 3. Chinese tea service (Tie Guan Yin specifically) instead of standard coffee service.",
    createdAt: "2026-02-23T08:00:00Z",
    updatedAt: "2026-02-23T08:00:00Z",
  },
  // Notes for req-18 (Kensington celebrity event)
  {
    id: "note-12",
    requestId: "req-18",
    authorId: "usr-4",
    content: "STRICT NDA applies to all drivers. Celebrity names must not be shared externally. Arrival timing: 30-second intervals between vehicles at the red carpet. PR team (Jessica Hall) will radio timing cues. All three Phantoms must have maximum tint — factory privacy glass confirmed.",
    createdAt: "2026-02-13T10:00:00Z",
    updatedAt: "2026-02-13T10:00:00Z",
  },
  {
    id: "note-13",
    requestId: "req-18",
    authorId: "usr-1",
    content: "V&A security team needs driver IDs 48 hours in advance. Parking in the service area behind Exhibition Road. Only NDA-cleared staff to be within 50m of drop-off zone. Insurance rider for celebrity damage coverage activated.",
    createdAt: "2026-02-14T15:00:00Z",
    updatedAt: "2026-02-14T15:00:00Z",
  },
  // Notes for req-21 (Okafor Lagos)
  {
    id: "note-14",
    requestId: "req-21",
    authorId: "usr-4",
    content: "Security escort arranged with Citadel Security (approved provider). Armored S-Class (B6 level). Two lead vehicles, one follow vehicle. Route survey completed on Feb 20. Primary route: Murtala Muhammed → Ozumba Mbadiwe Ave → Eko Atlantic. Backup via Lekki-Ikoyi Link Bridge.",
    createdAt: "2026-02-20T14:00:00Z",
    updatedAt: "2026-02-20T14:00:00Z",
  },
  // Notes for req-23 (Rothschild Caribbean yacht)
  {
    id: "note-15",
    requestId: "req-23",
    authorId: "usr-3",
    content: "Captain Morrison confirmed — he was delighted to hear about the repeat booking. Upgrading tender from 30ft to 40ft Riva requires swapping the davit crane. Cost: additional $45,000 for the charter period. Water toys package (Jet Skis, Seabobs, paddleboards, Flyboard) = $18,000.",
    createdAt: "2026-02-15T11:00:00Z",
    updatedAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "note-16",
    requestId: "req-23",
    authorId: "usr-3",
    content: "Children ages 8 and 11 joining. Youth entertainment coordinator: booking Sophia Maxwell (worked on 'Ocean Dream' charter for Ambani family). Need child-size life jackets, water safety briefing. Mrs. Rothschild wants a 'top-tier' spa therapist — contacting Aman Spa for their best available.",
    createdAt: "2026-02-16T15:00:00Z",
    updatedAt: "2026-02-16T15:00:00Z",
  },
  // Notes for req-6 (Sheikh BBJ)
  {
    id: "note-17",
    requestId: "req-6",
    authorId: "usr-1",
    content: "BBJ charter for 20 pax is a significant booking — estimated $380,000+. Need to source from our Middle East operators first. Al Reef Catering contact: +971 4 123 4567. They have the Sheikh's standing order on file. Bedroom suite with full en-suite bathroom is mandatory.",
    createdAt: "2026-02-24T12:00:00Z",
    updatedAt: "2026-02-24T12:00:00Z",
  },
  // Notes for req-9 (Harrington LAX)
  {
    id: "note-18",
    requestId: "req-9",
    authorId: "usr-5",
    content: "Standard transfer — no special requirements. Client is a repeat customer. Prefers quiet rides (no small talk). Water bottle in rear cup holder. Driver: Antonio.",
    createdAt: "2026-01-17T08:00:00Z",
    updatedAt: "2026-01-17T08:00:00Z",
  },
  // Notes for req-3 (Victoria helicopter)
  {
    id: "note-19",
    requestId: "req-3",
    authorId: "usr-3",
    content: "Mrs. Cheng-Worthington is very particular about helicopter models. AW139 only — she considers the H145 'too cramped.' Return flight at midnight means we need to confirm night-flying permissions with Macau CAA. Salon Privé at Grand Lisboa: her usual credit line is HKD 5M.",
    createdAt: "2026-02-19T09:00:00Z",
    updatedAt: "2026-02-19T09:00:00Z",
  },
  // Notes for req-15 (Mei Lin car)
  {
    id: "note-20",
    requestId: "req-15",
    authorId: "usr-4",
    content: "Still waiting on Ms. Zhang's itinerary. Reminder sent on Feb 24. If not received by Feb 27, we'll need to escalate — the driver needs at least 3 days to plan routes across Pudong and Bund. Traffic in those areas can be severe during March business season.",
    createdAt: "2026-02-24T11:30:00Z",
    updatedAt: "2026-02-24T11:30:00Z",
  },
  {
    id: "note-21",
    requestId: "req-11",
    authorId: "usr-4",
    content: "Ms. Petrova confirmed: still water (Fiji brand preferred) and light snacks (mixed nuts, dried fruit, no chocolate). Driver James is assigned — experienced with Cotswolds routes. Soho Farmhouse gate code to be collected day of from concierge.",
    createdAt: "2026-02-21T09:00:00Z",
    updatedAt: "2026-02-21T09:00:00Z",
  },
  {
    id: "note-22",
    requestId: "req-20",
    authorId: "usr-5",
    content: "First-time client. Standard BMW 7 Series transfer. Greenwich is about 60-75 min from JFK depending on traffic. Evening arrival should be smoother. No special requirements noted — treat as a standard premium transfer with excellent service to encourage repeat business.",
    createdAt: "2026-02-25T09:30:00Z",
    updatedAt: "2026-02-25T09:30:00Z",
  },
];
