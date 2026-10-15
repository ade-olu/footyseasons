// European places, relegation play-offs and relegation by final position,
// keyed "<league code>-<start year>". Taken from Wikipedia (includes cup
// winners and sanctions); add new seasons by hand.

export type TableZone =
  | "championsLeague"
  | "europaLeague"
  | "conferenceLeague"
  | "relegationPlayoff"
  | "relegation";

export type TablePlaces = Partial<Record<TableZone, number[]>>;

export const TABLE_PLACES: Record<string, TablePlaces> = {
  // PL = Premier League
  "PL-2014": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7, 12],
    relegation: [18, 19, 20],
  },
  "PL-2015": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PL-2016": {
    championsLeague: [1, 2, 3, 4, 6],
    europaLeague: [5, 7],
    relegation: [18, 19, 20],
  },
  "PL-2017": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PL-2018": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PL-2019": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 8],
    relegation: [18, 19, 20],
  },
  "PL-2020": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PL-2021": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PL-2022": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 14],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PL-2023": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 8],
    conferenceLeague: [6],
    relegation: [18, 19, 20],
  },
  "PL-2024": {
    championsLeague: [1, 2, 3, 4, 5, 17],
    europaLeague: [6, 7],
    conferenceLeague: [12],
    relegation: [18, 19, 20],
  },
  "PL-2025": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 7, 15],
    conferenceLeague: [8],
    relegation: [18, 19, 20],
  },

  // PD = La Liga
  // Elche were relegated from 13th for unpaid debts; 18th-placed Eibar stayed
  // up
  "PD-2014": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 7],
    relegation: [13, 19, 20],
  },
  "PD-2015": {
    championsLeague: [1, 2, 3, 4, 7],
    europaLeague: [5, 6],
    relegation: [18, 19, 20],
  },
  "PD-2016": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PD-2017": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PD-2018": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PD-2019": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "PD-2020": {
    championsLeague: [1, 2, 3, 4, 7],
    europaLeague: [5, 6],
    relegation: [18, 19, 20],
  },
  "PD-2021": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PD-2022": {
    championsLeague: [1, 2, 3, 4, 12],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PD-2023": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "PD-2024": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 7],
    conferenceLeague: [8],
    relegation: [18, 19, 20],
  },
  "PD-2025": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 10],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },

  // SA = Serie A
  "SA-2014": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 7],
    relegation: [18, 19, 20],
  },
  "SA-2015": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegation: [18, 19, 20],
  },
  "SA-2016": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegation: [18, 19, 20],
  },
  "SA-2017": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "SA-2018": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [6, 7, 8],
    relegation: [18, 19, 20],
  },
  "SA-2019": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegation: [18, 19, 20],
  },
  "SA-2020": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  "SA-2021": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },
  // Spezia (17th here) lost the relegation tie-breaker to Verona (18th here),
  // who stayed up
  "SA-2022": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [8],
    relegation: [17, 19, 20],
  },
  "SA-2023": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 7],
    conferenceLeague: [8],
    relegation: [18, 19, 20],
  },
  "SA-2024": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 9],
    conferenceLeague: [6],
    relegation: [18, 19, 20],
  },
  "SA-2025": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegation: [18, 19, 20],
  },

  // BL1 = Bundesliga
  "BL1-2014": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2015": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2016": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2017": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 8],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2018": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2019": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6, 7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2020": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2021": {
    championsLeague: [1, 2, 3, 4, 11],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2022": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2023": {
    championsLeague: [1, 2, 3, 4, 5],
    europaLeague: [6, 7],
    conferenceLeague: [8],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2024": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 9],
    conferenceLeague: [6],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "BL1-2025": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },

  // FL1 = Ligue 1
  "FL1-2014": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegation: [18, 19, 20],
  },
  "FL1-2015": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegation: [18, 19, 20],
  },
  "FL1-2016": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegationPlayoff: [18],
    relegation: [19, 20],
  },
  "FL1-2017": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegationPlayoff: [18],
    relegation: [19, 20],
  },
  "FL1-2018": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 10, 11],
    relegationPlayoff: [18],
    relegation: [19, 20],
  },
  "FL1-2019": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5, 6],
    relegation: [19, 20],
  },
  "FL1-2020": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 5],
    conferenceLeague: [6],
    relegationPlayoff: [18],
    relegation: [19, 20],
  },
  "FL1-2021": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 9],
    conferenceLeague: [5],
    relegationPlayoff: [18],
    relegation: [19, 20],
  },
  "FL1-2022": {
    championsLeague: [1, 2, 3],
    europaLeague: [4, 13],
    conferenceLeague: [5],
    relegation: [17, 18, 19, 20],
  },
  "FL1-2023": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "FL1-2024": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
  "FL1-2025": {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5, 6],
    conferenceLeague: [7],
    relegationPlayoff: [16],
    relegation: [17, 18],
  },
};

// The zone a club finished in from its position, if any
export function getTableZone(
  places: TablePlaces | undefined,
  position: number,
): TableZone | undefined {
  if (!places) return undefined;

  return (Object.keys(places) as TableZone[]).find((zone) =>
    places[zone]?.includes(position),
  );
}
