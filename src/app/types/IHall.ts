import {IDuration} from './IDuration';

export interface IHall {
    uuid: string,
    Hall: any,
    Spot: any,
    has_geometry: boolean,
    is_for_sale: boolean,
    season_event_uuid: string,
    is_season_head: boolean,
    is_season_part: boolean,
    season_schedules: any,
    begin_time: string,
    end_time: string,
    duration: IDuration,
    PriceValues: any,
    MinPrice: any,
    MaxPrice: any
}
