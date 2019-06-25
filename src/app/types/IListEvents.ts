export interface IListEvents {
    uuid: string,
    product_type: string,
    product_category_uuid: any,
    tags: any,
    name: any,
    short_name: any,
    description: any,
    short_description: any,
    extended_props: any,
    poster: {
        name: string,
        path: string,
        size: number,
        resolution: {
            w: number,
            h: number
        },
        type: string
    },
    rating: any,
    pg_rating: string,
    NearestSchedule: {
        uuid: string,
        Hall: any,
        Spot: any,
        has_geometry: boolean,
        is_for_sale: boolean,
        season_event_uuid: any,
        is_season_head: boolean,
        is_season_part: boolean,
        season_schedules: any,
        begin_time: string,
        end_time: string,
        duration: any
    }
}