import { bangladeshData } from 'bd-geo-location';

export const ALL_DISTRICTS = bangladeshData.divisions.flatMap(d => d.districts);
