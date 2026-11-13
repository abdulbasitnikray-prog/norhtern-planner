# Design note

**User:** a student or family in Islamabad planning a 2-14 day northern trip. **Problem:** hard to know if chosen places fit their days, budget and season.

## WDLC stages
1. **Planning:** defined user, problem, core workflow (details, explore, itinerary).
2. **Analysis:** needs are filtering, cost calculation, conflict checks, validated input.
3. **Design:** wireframe below, mobile-first layout, colour/contrast choices.
4. **Implementation:** semantic HTML, CSS Grid/Flexbox, vanilla JS.
5. **Testing:** invalid form values, empty filter results, empty itinerary, three screen sizes, keyboard-only use.
6. **Maintenance:** data is in one array in `app.js`; later assignments add a backend and database.

## Wireframe (all sizes stack in this order)
```
[Header + nav]
[1. Trip details form: 1 col mobile / 2 tablet / 3 desktop]
[2. Filters row] [Cards: 1 / 2 / 3 columns]
[3. Itinerary list + summary + alerts]
[Footer]
```

## Browser (client) vs server
**Client now:** all HTML/CSS/JS, validation, filtering, calculations, conflict checks, in-memory itinerary.
**Server later (Assignments 2-3):** storing destinations and saved trips, user accounts, real availability. Nothing runs on a server at this stage.
